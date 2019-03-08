import { createAction, ActionType, getType } from 'typesafe-actions'
import { NodeState } from '@textile/react-native-sdk'
import { RootState } from './Types'

const actions = {
  nodeOnline: createAction('NODE_ONLINE'),
  newNodeState: createAction('NEW_NODE_STATE', (resolve) => {
    return (nodeState: NodeState) => resolve({ nodeState })
  }),
  ipfsImage: createAction('IPFS_IMAGE', (resolve) => {
    return (ipfsImage: string) => resolve({ ipfsImage })
  })
}

export type MainActions = ActionType<typeof actions>

export interface MainState {
  online: boolean
  nodeState: NodeState
  ipfsImage?: string
}

const initialState: MainState = {
  online: false,
  nodeState: NodeState.nonexistent
}

export function reducer(state = initialState, action: MainActions) {
  switch (action.type) {
    case getType(actions.nodeOnline): {
      return { ...state, online: true }
    }
    case getType(actions.newNodeState): {
      return { ...state, nodeState: action.payload.nodeState }
    }
    case getType(actions.ipfsImage): {
      return { ...state, ipfsImage: `data:image/png;base64,${action.payload.ipfsImage}` }
    }
    default:
      return state
  }
}

export const MainSelectors = {
  nodeOnline: (state: RootState) => state.main.online,
  nodeState: (state: RootState) => state.main.nodeState
}
export default actions
