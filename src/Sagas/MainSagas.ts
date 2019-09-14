import { takeLatest, put, call, delay } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions from '../Redux/MainRedux'
import Textile from '@textile/react-native-sdk'
import FS from 'react-native-fs'

const IPFS_PIN = 'QmZGaNPVSyDPF3xkDDF847rGcBsRRgEbhAqLLBD4gNB7ex/0/content'

function* initializeTextile() {
  try {
    const textileRepoPath = `${FS.DocumentDirectoryPath}/textile-go`

    const initialized = yield call(
      Textile.isInitialized,
      textileRepoPath
    )
    if (!initialized) {
      const phrase = yield call(
        Textile.initializeCreatingNewWalletAndAccount,
        textileRepoPath,
        false,
        false
      )
    }
    
    yield call(Textile.launch, textileRepoPath, false)
    
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
    const imageData: { data: Uint8Array; mediaType: string } = yield call(Textile.ipfs.dataAtPath, IPFS_PIN)
    // @ts-ignore
    yield put(MainActions.loadIPFSDataSuccess(imageData.data.toString('base64')))
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

  if (action.payload.nodeState === 'started') {
      // Read about Textile Cafes here, https://docs.textile.io/concepts/cafes/
      yield call(Textile.cafes.register, 'https://us-west-dev.textile.cafe', 'uggU4NcVGFSPchULpa2zG2NRjw2bFzaiJo3BYAgaFyzCUPRLuAgToE3HXPyo')
  }
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield call(initializeTextile)
  yield takeLatest('NODE_ONLINE', onOnline)
  yield takeLatest('NEW_NODE_STATE', newNodeState)
  yield takeLatest('LOAD_IPFS_DATA_REQUEST', loadIPFSData)
}
