import { takeLatest, put, call, delay } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions from '../Redux/MainRedux'
import Textile from '@textile/react-native-sdk'

const IPFS_PIN = 'QmZGaNPVSyDPF3xkDDF847rGcBsRRgEbhAqLLBD4gNB7ex/0/content'

function* initializeTextile() {
  try {
    yield call(Textile.initialize, false, false)
  } catch (error) {
    yield put(MainActions.newNodeState('error'))
  }
}

export function* onOnline(action: ActionType<typeof MainActions.nodeOnline>) {
  console.info('Running onOnline Saga')
  yield put(MainActions.loadIPFSData())
}

export function* loadIPFSData(
  action: ActionType<typeof MainActions.loadIPFSData>
) {
  try {
    // here we request raw data, where in the view, we'll use TextileImage to just render the request directly
    const imageData = yield call(Textile.ipfs.dataAtPath, IPFS_PIN)
    yield put(MainActions.loadIPFSDataSuccess(imageData))
    console.info('IPFS Success')
  } catch (error) {
    console.info('IPFS Failure. Waiting 0.5s')
    yield delay(1500)
    yield put(MainActions.loadIPFSData())
  }
}

/* eslint require-yield:1 */
export function* newNodeState(
  action: ActionType<typeof MainActions.newNodeState>
) {
  console.info('Running newNodeState Saga')
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield call(initializeTextile)
  yield takeLatest('NODE_ONLINE', onOnline)
  yield takeLatest('NEW_NODE_STATE', newNodeState)
  yield takeLatest('LOAD_IPFS_DATA_REQUEST', loadIPFSData)
}
