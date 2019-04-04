import { takeLatest } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions from '../Redux/MainRedux'
import { put, call, delay } from 'redux-saga/effects'
import { API } from '@textile/react-native-sdk'

const IPFS_PIN = 'QmTgtbb4LckHaXh1YhpNcBu48cFY8zgT1Lh49q7q7ksf3M/raster-generated/ipfs-logo-256-ice.png'

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield takeLatest('NODE_ONLINE', onOnline)
  yield takeLatest('NEW_NODE_STATE', newNodeState)
  yield takeLatest('LOAD_IPFS_DATA_REQUEST', loadIPFSData)
}

export function * onOnline(action: ActionType<typeof MainActions.nodeOnline>) {
  console.info('Running onOnline Saga')
  yield put(MainActions.loadIPFSData())
}

export function * loadIPFSData(action: ActionType<typeof MainActions.loadIPFSData>) {
  try {
    // here we request raw data, where in the view, we'll use TextileImage to just render the request directly
    const imageData = yield call(API.ipfs.dataAtPath, IPFS_PIN)
    yield put(MainActions.loadIPFSDataSuccess(imageData))
    console.info('IPFS Success')
  } catch (error) {
    console.info('IPFS Failure. Waiting 0.5s')
    yield delay(500)
    yield put(MainActions.loadIPFSData())
  }
}

export function * newNodeState(action: ActionType<typeof MainActions.newNodeState>) {
  console.info('Running newNodeState Saga')
}

