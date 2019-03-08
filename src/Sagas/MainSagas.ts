import { takeLatest } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions from '../Redux/MainRedux'
import { put, call } from 'redux-saga/effects'
import { API } from '@textile/react-native-sdk'

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield takeLatest('NODE_ONLINE', onOnline)
  yield takeLatest('NEW_NODE_STATE', newNodeState)
}

export function * onOnline(action: ActionType<typeof MainActions.nodeOnline>) {
  console.info('Running onOnline Saga')
  const imageData = yield call(API.ipfs.dataAtPath, 'QmTgtbb4LckHaXh1YhpNcBu48cFY8zgT1Lh49q7q7ksf3M/raster-generated/ipfs-logo-256-ice.png')
  yield put(MainActions.ipfsImage(imageData))
}

export function * newNodeState(action: ActionType<typeof MainActions.newNodeState>) {
  console.info('Running newNodeState Saga')
}

