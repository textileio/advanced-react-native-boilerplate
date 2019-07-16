import { takeLatest, put, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { ActionType } from 'typesafe-actions'
import { Buffer } from 'buffer'
import MainActions, {MainSelectors} from '../../Redux/MainRedux'
import Textile, { IExternalInvite } from '@textile/react-native-sdk'
import { Alert } from 'react-native'
import { collectThreads } from '../MainSagas'

// export function *pullInvite(id: string, threadId: string) {
//   const gateway = `${cafeUrl}/ipfs/${id}`
//   console.log('gateway')
//   console.log(gateway)
//   yield call(delay, 500)
//   const data: string = yield fetch(gateway).then((response) => response.toString() )//.text())
//   console.log()
//   console.log('data')
//   console.log(data)
//   console.log()
//   console.log(threadId)
//   console.log()
//   const input = Buffer.from(data).toString('base64')
//   console.log(input)
//   console.log()
//   const prepared: IMobilePreparedFiles = yield call([Textile.files, 'prepare'], input , threadId)
//   console.log(prepared)
//   const result = yield call([Textile.files, 'add'], prepared.dir, threadId)

//   // console.log(result)
//   console.log(prepared.dir.files[':single'].hash)


//   try {
//     yield call([Textile.invites, 'acceptExternal'], prepared.dir.files[':single'].hash, '2tSCJEL3Btuh9Ee2GXA2CnRPuANUU22zT9XtrXcysqNovRRRg5NfdCUqpuFL')
//   } catch (err) {
//     console.log(err)
//   }
// }
// export function *primePump(id: string) {
//   const inviteKeyPrefix = 'textile_ipfs-tag-invites'
//   const threads = yield call([Textile.threads, 'list'])
//   const invites = threads.items.filter((item) => item.key.indexOf(inviteKeyPrefix) !== -1)
//   if (invites.length) {
//     const thread = invites[0]
//     yield call(pullInvite, id, thread.id)
//   } else {
//     const key = `${inviteKeyPrefix}-0`

//     const tagSchema = {
//       "name": "cmd-line-tag-invites",
//       "mill": "/blob",
//       "plaintext": true
//     }

//     const config: IAddThreadConfig = {
//       key,
//       name: 'invite-cache',
//       type: Thread.Type.PRIVATE,
//       sharing: Thread.Sharing.NOT_SHARED,
//       schema: { id: '', json: JSON.stringify(tagSchema), preset: AddThreadConfig.Schema.Preset.NONE },
//       force: false,
//       whitelist: []
//     }
//     const thread = yield call([Textile.threads, 'add'], config)
//     yield call(pullInvite, id, thread.id)
//   }
// }

function * transmitHeartbeat(invite: IExternalInvite, date: number) {
  try {
    yield put(MainActions.newSharedInvite(invite.id, invite.key, date))
    const gameThread = yield select(MainSelectors.gameThread)
    if (gameThread) {
      const payload = JSON.stringify({ "event": "invite", "id": invite.id, "key": invite.key})
      const input = Buffer.from(payload).toString('base64')
      yield call(Textile.files.addData, input, gameThread.id)
    }
  } catch (err) {
    console.log(err)
  }
}

export function* generateNewInvite(action: ActionType<typeof MainActions.generateNewInvite>) {
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread) {
    // check if we have a shared invite that is less than 30m old
    const sharedInvite = yield select(MainSelectors.sharedInvite)
    const date = (new Date().getTime()) / 1000
    if (sharedInvite && sharedInvite.date && date - sharedInvite.date < 1800 && date - sharedInvite.date > 0) {
      // if we do have a valid shared invite, use it instead of creating a new one
      const profile = yield select(MainSelectors.profile)
      const address = profile && profile.address ? profile.address : ''
      const invite: IExternalInvite = {id: sharedInvite.id, key: sharedInvite.key, inviter: address}
      yield put(MainActions.generateNewInviteSuccess(invite))
      yield call(transmitHeartbeat, invite, date)
    } else {
      // no valid shared invite, so create a novel external invite and share it with the rest of the players
      const invite = yield call([Textile.invites, 'addExternal'], gameThread.id)
      yield put(MainActions.generateNewInviteSuccess(invite))
      yield call(transmitHeartbeat, invite, date)
    }
  }
}

export function displayInvitePromise(message: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    Alert.alert(
      'Accept Invite',
      message,
      [
        {
          text: 'Accept',
          onPress: resolve
        },
        {
          text: 'Ignore',
          style: 'cancel',
          onPress: reject
        }
      ],
      { cancelable: false }
    )
  })
}

export function* processInvite(id: string, key: string, attempt: number) {
  try {
    yield call([Textile.invites, 'acceptExternal'], id, key)
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: 'Game found!'}
    ))
    yield call(collectThreads)
  } catch (error) {
      if (error && error.message) {
        if (error.message === 'context deadline exceeded' && attempt < 2) {
          yield put(MainActions.pushNewMessage(
            {type: 'text', message: `${error.message}.`}
          ))
          yield put(MainActions.pushNewMessage(
            {type: 'text', message: `Automatic retry ${attempt + 1}/2.`}
          ))
          yield call(delay, 500)
          yield call(processInvite, id, key, attempt + 1)
        } else {
          yield put(MainActions.pushNewMessage(
            {type: 'text', message: `Try again: ${error.message}.`}
          ))
          throw new Error(error.message)
        }
      }
  }
}

export function* newInvite(action: ActionType<typeof MainActions.newInvite>) {
  const online = yield select(MainSelectors.nodeOnline)
  if (!online) {
    yield call(delay, 1000)
  }
  const profile = yield select(MainSelectors.profile)
  if (!profile) {
    Alert.alert(
      'Accept Invite',
      'You must pick your name first.'
    )
    return
  }
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread) {
    Alert.alert(
      'Accept Invite',
      'Sorry, you are already in a game.'
    )
    return
  }

  try {
    yield call(displayInvitePromise, 'Join game?')
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: 'Locating game on IPFS.'}
    ))
    yield call(processInvite, action.payload.id, action.payload.key, 0)
    
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: 'Remember, if anyone shows you their red card, you are it!'}
    ))
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: 'If the next screen is red... you are it!'}
    ))
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: 'Once you are it, you must scan their QR code to take over.'}
    ))
  } catch (error) {
    //pass: user declined
  }
}

// export function* newJoinRequest(action: ActionType<typeof MainActions.newJoinRequest>) {
//   // todo: check of self has a game going
//   const { contact } = action.payload
//   try {
//     // add to contacts 
//     yield call(Textile.contacts.add, contact)

//     // todo: Alert confirm the user wants to add the target

//     // todo: send p2p invite to contact
//   } catch (error) {
//     yield put(actions.addContactError(contact, error))
//   }

// }

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* initInvitesSagas() {
  yield takeLatest('NEW_INVITE', newInvite)
  yield takeLatest('GENERATE_NEW_INVITE', generateNewInvite)
}
