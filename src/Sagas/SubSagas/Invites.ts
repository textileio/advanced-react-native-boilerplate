import { takeLatest, put, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { ActionType } from 'typesafe-actions'
import MainActions, {MainSelectors} from '../../Redux/MainRedux'
import Textile from '@textile/react-native-sdk'
import { Alert } from 'react-native'
import { collectThreads } from '../MainSagas'

export function* generateNewInvite(action: ActionType<typeof MainActions.generateNewInvite>) {
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread) {
    const invite = yield call([Textile.invites, 'addExternal'], gameThread.id)
    yield put(MainActions.generateNewInviteSuccess(invite))
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
