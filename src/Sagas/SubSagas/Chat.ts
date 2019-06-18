import { takeLatest, put, call, select } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions, {MainSelectors} from '../../Redux/MainRedux'
import Textile, { Thread, ITextList }  from '@textile/react-native-sdk'
import { leaveGame } from './Game'
import { refreshGameContacts } from './Contacts'

export function* refreshMessagesRequest(action: ActionType<typeof MainActions.refreshMessagesRequest>) {
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread && gameThread.id === action.payload.threadId) {
    yield call(updateMessages, gameThread)
  }
}

export function* updateMessages(thread: Thread) {
  try {
    let messages: ITextList = yield call([Textile.messages, 'list'], '', 100000, thread.id)
    yield put(MainActions.updateMessages(messages.items))
  } catch (error) {
    // pass
  }
}

export function* sendMessage(action: ActionType<typeof MainActions.sendMessage>) {
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread) {
    const { text } = action.payload
    if (text === '/leave') {
      yield call(leaveGame)
      return
    }
    yield call([Textile.messages, 'add'], gameThread.id, text)  
    yield call(updateMessages, gameThread.id)
  }
}

export function* refreshChatRequest(action: ActionType<typeof MainActions.refreshChatRequest>) {
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread) {
    // Contacts are shown as chats too
    yield call(refreshGameContacts, gameThread)
    yield call(updateMessages, gameThread)
  }
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* initChatSagas() {
  yield takeLatest('SEND_MESSAGES', sendMessage)
  yield takeLatest('REFRESH_MESSAGES_REQUEST', refreshMessagesRequest)
  yield takeLatest('REFRESH_CHAT_REQUEST', refreshChatRequest)
}
