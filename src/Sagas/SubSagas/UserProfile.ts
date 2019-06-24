import { takeLatest, put, call } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions from '../../Redux/MainRedux'
import Textile  from '@textile/react-native-sdk'
import { checkCurrentGame } from './Game'

/**
 * Gets the user's current profile
 */
export function *getUserProfile() {
  const profile = yield call([Textile.profile, 'get'])
  if (!profile.name) {
    // User hasn't finished onboarding
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: 'Welcome to Interplanetary Tag!'}
    ))
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: 'Don\'t worry, you\'re not it... yet. First let\'s get you setup.'}
    ))
    return
  } 
  // User hasn't finished onboarding
  yield put(MainActions.pushNewMessage(
    {type: 'text', message: `Welcome back, ${profile.name}`}
  ))
  yield put(MainActions.updateProfile(profile))
  yield call(checkCurrentGame)
}

/**
 * Once the node is connected to the world, we can start doing stuff
 */
export function* setDisplayName(action: ActionType<typeof MainActions.setDisplayName>) {
  try {
    yield call([Textile.profile, 'setName'], action.payload.displayName)
    const profile = yield call([Textile.profile, 'get'])
    yield put(MainActions.updateProfile(profile))
    yield call(checkCurrentGame)

  } catch (error) {
    yield put(MainActions.pushNewMessage(
      {type: 'text', message: `Eeek: ${error.message}`}
    ))
  }
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* initUserProfileSagas() {
  // Onboarding
  yield takeLatest('SET_DISPLAY_NAME', setDisplayName)
}
