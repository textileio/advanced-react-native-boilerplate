import { takeLatest } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions from '../Redux/MainRedux'

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield takeLatest('NODE_STARTED', nodeStarted)
  yield takeLatest('NEW_NODE_STATE', newNodeState)
}

export function * nodeStarted(action: ActionType<typeof MainActions.nodeStarted>) {
  console.info('Running nodeStarted Saga')
}

export function * newNodeState(action: ActionType<typeof MainActions.newNodeState>) {
  console.info('Running newNodeState Saga')
}
