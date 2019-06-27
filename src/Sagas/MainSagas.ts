import { takeLatest, put, call, select, all, fork } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions, {MainSelectors} from '../Redux/MainRedux'
import Textile from '@textile/react-native-sdk'
import { initChatSagas } from './SubSagas/Chat'
import { initContactsSagas } from './SubSagas/Contacts'
import { initGameSagas, keyPrefix } from './SubSagas/Game'
import { initInvitesSagas } from './SubSagas/Invites'
import { getUserProfile, initUserProfileSagas } from './SubSagas/UserProfile'

export const cafeUrl = 'https://eu-west-1.textile.cafe'
/**
 * Starts up the Textile & IPFS peers
 */
export function *initializeTextile() {
  try {
    yield call(Textile.initialize, false, false)
  } catch (error) {
    yield put(MainActions.newNodeState('error'))
  }
}

/**
 * Gets all the latest threads, just throws the user into the latest one.
 */
export function *collectThreads() {
  const threads = yield call([Textile.threads, 'list'])
  const games = threads.items.filter((item) => item.key.indexOf(keyPrefix) !== -1)
  if (games.length) {
    yield put(MainActions.setCurrentGame(games[0]))
  }
}

/**
 * Once the node is connected to the world, we can start doing stuff
 */
export function* onOnline(action: ActionType<typeof MainActions.nodeOnline>) {
  console.info('Running onOnline Saga')
  yield call(getUserProfile)
  const peerId = yield call([Textile.ipfs, 'peerId'])
  yield put(MainActions.updatePeerId(peerId))
  const cafeRegistered = yield select(MainSelectors.cafeRegistered)
  try {
    if (!cafeRegistered) {
      const cafes = yield call([Textile.cafes, 'sessions'])
      if (!cafes.items.length) {
        yield call(
          [Textile.cafes, 'register'],
          cafeUrl,
          ''
        )
      }
      console.log('REGISTRATION SUCCESS')
      yield put(MainActions.cafeRegistrationSuccess())
    } else {
      console.log('REGISTRATION EXISTS')
    }
  } catch (error) {
    // pass, not too worried about the cafe in this app
  }

  yield put(MainActions.pushNewMessage(
    {type: 'text', message: 'connected'}
  ))
}

/* eslint require-yield:1 */
export function* newNodeState( action: ActionType<typeof MainActions.newNodeState>) {
  console.info('newNodeState')
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield takeLatest('NODE_ONLINE', onOnline)
  yield takeLatest('NEW_NODE_STATE', newNodeState)
  yield put(MainActions.pushNewMessage({
    type: 'text',
    message: 'waiting for node...'
  }))
  yield all([
    fork(initChatSagas),
    fork(initContactsSagas),
    fork(initGameSagas),
    fork(initInvitesSagas),
    fork(initUserProfileSagas),
  ])
  yield call(initializeTextile)

}
