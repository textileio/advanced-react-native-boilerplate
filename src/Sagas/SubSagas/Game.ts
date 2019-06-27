import { takeLatest, put, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { ActionType } from 'typesafe-actions'
import MainActions, {MainSelectors} from '../../Redux/MainRedux'
import Textile, { AddThreadConfig, IAddThreadConfig, Thread, IFilesList, IContact }  from '@textile/react-native-sdk'
import uuid from 'uuid/v4'
import { Buffer } from 'buffer'
import { Alert } from 'react-native'
import { collectThreads } from '../MainSagas'
import { refreshGameContacts } from './Contacts'
import { updateMessages } from './Chat'

export const keyPrefix = 'textile_ipfs-tag-shared'

/** 
  * The schema for a game of tag.
  * 
  * an 'event' is required
  * 
  * Allowed event types are:
  * 'start' - only recognized if by the initator and only the first time. must contain a 'duration'
  * 'tag' - only recognized if by the person getting tagged (the 'target'). must contain the correct tagger (the 'source')
  * 'restart' - only recognized if game has been ended. only recognized the first time.
  * 
  * Other fields
  * 'duration' only contained in 'start' events
  * 'target' is the person who gets tagged in a 'tag' event. verified by the block signature
  * 'source' is the person who does the tagging, must match the last verified 'tag' target
  * 'extra' is not currently used, we could delete it with no harm.
  */

const tagSchema = {
  "name": "cmd-line-tag",
  "mill": "/json",
  "json_schema": {
      "title": "CMD Line Tag Mechanics",
      "description": "Possible events in cmd line tag.",
      "type": "object",
      "required": [ "event" ],
      "properties": {
          "event": {
              "type": "string",
              "description": "event type identifier"
          },
          "target": {
              "type": "string",
              "description": "peer-id of the person getting tagged"
          },
          "source": {
              "type": "string",
              "description": "peer-id of the person doing the tagging"
          },
          "duration": {
              "type": "number",
              "description": "game duration"
          },
          "extra": {
              "type": "string",
              "description": "extra information"
          }
      }
  }
}


/**
 * Gets all the latest threads, just throws the user into the latest one.
 */
export function *checkCurrentGame() {
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread) {
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: 'Watch out, game on!'}
    ))
    return
  }
  yield call(collectThreads)
}

export function* createNewGame(action: ActionType<typeof MainActions.createNewGameSuccess>) {
  try {
    const { name } = action.payload
    const key = `${keyPrefix}-${uuid()}`
    const config: IAddThreadConfig = {
      key,
      name,
      type: Thread.Type.OPEN,
      sharing: Thread.Sharing.SHARED,
      schema: { id: '', json: JSON.stringify(tagSchema), preset: AddThreadConfig.Schema.Preset.NONE },
      force: false,
      whitelist: []
    }
    const thread = yield call([Textile.threads, 'add'], config)
    yield put(MainActions.setCurrentGame(thread))
  } catch (error) {
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: `Lame: ${error.message}`}
    ))
  }
}


export function* setCurrentGame(action: ActionType<typeof MainActions.setCurrentGame>) {
  const { thread } = action.payload
  yield call(checkGameStatus, thread)
}

export function* refreshGameInfo(action: ActionType<typeof MainActions.refreshGameInfo>) {
  const { threadId } = action.payload
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread && gameThread.id === threadId) {
    yield call(checkGameStatus, gameThread)
  }
}

export function* refreshGameRequest() {
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread) {
    yield call(checkGameStatus, gameThread)
  }
}

export function* checkGameStatus(thread: Thread) {
  try {

    const gameStarted = yield select(MainSelectors.gameStarted)

    const files: IFilesList = yield call([Textile.files, 'list'], thread.id, '', 100000)

    const { initiator } = thread
    const now = (new Date().getTime()) / 1000
    let started = false
    let startTime = now // very first start of the game
    let duration = 24 * 3600 // total duration of each game in this set
    let tagged: IContact = yield call([Textile.contacts, 'get'], initiator)
    let restarts: number = 0

    for (const file of files.items.reverse()) {
      if (file.files.length === 0) {
        continue
      }
      const actor = file.user.address
      const { data } = yield call([Textile.files, 'content'], file.files[0].file.hash)
      const json = Buffer.from(data).toString()
      const gameEvent = JSON.parse(json)

      // Deal with the very first start event
      if (started === false && actor === initiator && gameEvent.event === 'start') {
        started = true
        startTime = file.date.seconds as number
        yield put(MainActions.newTag(tagged, tagged, file.block, file.date.seconds as number, true))

        duration = gameEvent.duration
        if (duration){
          // from 0 - 365 days
          const allowedDuration = Math.max(
            0,
            Math.min(duration, (24 * 3600 * 365))
          )
          yield put(MainActions.setGameDuration(allowedDuration))
        }

        continue
      }

      // Deal with restart events
      if (started === true && startTime + duration < now && gameEvent.event === 'restart') {
        restarts += 1
        startTime = file.date.seconds as number
        yield put(MainActions.newTag(tagged, tagged, file.block, file.date.seconds as number, false, restarts))
      }

      // Game must be started for tags to count
      // Event type should be a tag
      // The tag source should match the currently it
      // Only a block author can make themself it, actor === gameEvent.target
      if (started === true && gameEvent.event === 'tag' && gameEvent.source === tagged.address && actor === gameEvent.target) {
        const newlyTagged: IContact = yield call([Textile.contacts, 'get'], gameEvent.target)
        yield put(MainActions.newTag(tagged, newlyTagged, file.block, file.date.seconds as number))
        tagged = newlyTagged
      }
    }

    if (started) {
      yield put(MainActions.startGameSuccess(startTime))
    }
    yield put(MainActions.setCurrentIt(tagged))

    yield call(refreshGameContacts, thread)
    yield call(updateMessages, thread)

  } catch (error) {
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: `Uh oh: ${error.message}`}
    ))
  }
}


export function *restartGame() {
  try {
    const gameThread = yield select(MainSelectors.gameThread)
    const profile = yield select(MainSelectors.profile)
    if (gameThread && profile) {
      yield call(checkGameStatus, gameThread)
      const started = yield select(MainSelectors.gameStarted)
      const startTime = yield select(MainSelectors.startSeconds)
      const duration = yield select(MainSelectors.duration)
      const now = (new Date().getTime()) / 1000
      if (started && startTime + duration < now) {
        const payload = JSON.stringify({ "event": "restart", "duration": duration})
        const input = Buffer.from(payload).toString('base64')
        yield call(Textile.files.addData, input, gameThread.id)
        yield call(checkGameStatus, gameThread)
      }
    } 
  } catch (error) {
    console.log('error')
  }
}

export function* joinGame() {
  yield put(MainActions.pushNewMessage(
    {type: 'text', message: 'Easy.'}
  ))
  yield put(MainActions.pushNewMessage(
    {type: 'text', message: '1. Have someone show you the secret invite QR code for the game.'}
  ))
  yield put(MainActions.pushNewMessage(
    {type: 'text', message: '2. Point this phone\'s native camera app at the QR code. Be sure that QR codes are enabled in your Camera Settings.'}
  ))
  yield put(MainActions.pushNewMessage(
    {type: 'text', message: '3. When prompted, open the link in this app.'}
  ))
  yield put(MainActions.pushNewMessage(
    {type: 'text', message: '4. Accept the invite and watch out!'}
  ))
}

export function* setGameDurationRequest(action: ActionType<typeof MainActions.setGameDurationRequest>) {
  try {
    const profile = yield select(MainSelectors.profile)
    const gameThread = yield select(MainSelectors.gameThread)
    if (gameThread && profile && profile.address) {

      const { seconds } = action.payload
      if (seconds < 0 || (24 * 3600 * 365) < seconds) {
        yield put(MainActions.pushNewMessage(
          {type: 'text', message: `Hmm... a game of tag longer than a year?`}
        ))
        return
      }

      yield put(MainActions.setGameDuration(seconds))
    }
  } catch (error) {
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: `Eee: ${error.message}`}
    ))
  }
}


export function *jsonToArray (json) {
	var str = JSON.stringify(json, null, 0);
	var ret = new Uint8Array(str.length);
	for (var i = 0; i < str.length; i++) {
		ret[i] = str.charCodeAt(i);
	}
	return ret
}

export function* startGame(action: ActionType<typeof MainActions.startGame>) {
  try {
    const profile = yield select(MainSelectors.profile)
    const gameThread = yield select(MainSelectors.gameThread)
    const duration = yield select(MainSelectors.duration)
    if (gameThread && profile && profile.address) {
      const startJson = { "event": "start", "target": profile.address, duration }
      const payload = JSON.stringify(startJson)
      const input = Buffer.from(payload).toString('base64')
      yield call(Textile.files.addData, input, gameThread.id)

      const seconds = Math.round((new Date()).getTime() / 1000)
      yield put(MainActions.startGameSuccess(seconds))
      
      yield put(MainActions.setCurrentIt(profile))
    }
  } catch (error) {
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: `Oops: ${error.message}`}
    ))
  }
}

export function* leaveGame() {
  try {
    const gameThread = yield select(MainSelectors.gameThread)
    if (gameThread) {
      yield call([Textile.threads, 'remove'], gameThread.id)
      yield put(MainActions.pushNewMessage(
        {type: 'text', message: 'Good choice, that game was lame anyway.'}
      ))
      yield put(MainActions.leaveGameSuccess())
      yield call(collectThreads)
    }
  } catch (error) {
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: `Yikes: ${error.message}`}
    ))
  }
}

export function* tagUser(action: ActionType<typeof MainActions.tagged>) {
  const online = yield select(MainSelectors.nodeOnline)
  if (!online) {
    yield call(delay, 1000)
  }
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread) {
    yield call(checkGameStatus, gameThread)
    const tagged = yield select(MainSelectors.currentIt)
    if (tagged.address !== action.payload.tagger) {
      Alert.alert(
        'Hmm...',
        'That person is\'t currently tagged.'
      )
      return
    }

    const common = yield call([Textile.contacts, 'threads'], action.payload.tagger)
    if (!common) {
      Alert.alert(
        'Hmm...',
        'That person is\'t it in your current game.'
      )
      return
    }
    const profile = yield select(MainSelectors.profile)
    const payload = JSON.stringify({ 'event': 'tag', 'target': profile.address, 'source': action.payload.tagger })
    
    const input = Buffer.from(payload).toString('base64')
    yield call(Textile.files.addData, input, gameThread.id)

    Alert.alert(
      'You\'ve been tagged!'
    )

    yield call(checkGameStatus, gameThread)
  } else {
    Alert.alert(
      'Wait a second',
      'Are you sure you\'ve already joined a game?'
    )
  }
} 

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* initGameSagas() {
  // New game creation
  yield takeLatest('JOIN_GAME', joinGame)
  yield takeLatest('CREATE_NEW_GAME_SUCCESS', createNewGame)
  // Game joining
  yield takeLatest('SET_CURRENT_GAME', setCurrentGame)
  yield takeLatest('SET_GAME_DURATION_REQUEST', setGameDurationRequest)

  yield takeLatest('REFRESH_GAME', refreshGameInfo)
  yield takeLatest('START_GAME', startGame)
  yield takeLatest('LEAVE_GAME', leaveGame)
  yield takeLatest('REFRESH_GAME_REQUEST', refreshGameRequest)
  yield takeLatest('TAGGED', tagUser)

  yield takeLatest('RESTART_GAME', restartGame)
}
