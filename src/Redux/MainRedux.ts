import { createAction, ActionType, getType } from 'typesafe-actions'
import { NodeState } from '@textile/react-native-sdk'
import { RootState } from './Types'

const actions = {
  nodeStarted: createAction('NODE_STARTED'),
  newNodeState: createAction('NEW_NODE_STATE', (resolve) => {
    return (nodeState: NodeState) => resolve({ nodeState })
  })
}

export type MainActions = ActionType<typeof actions>

export interface MainState {
  started: boolean
  nodeState: NodeState
}

const initialState: MainState = {
  started: false,
  nodeState: NodeState.nonexistent
}

export function reducer(state = initialState, action: MainActions) {
  switch (action.type) {
    case getType(actions.nodeStarted): {
      return { ...state, started: true }
    }
    case getType(actions.newNodeState): {
      return { ...state, nodeState: action.payload.nodeState }
    }
    default:
      return state
  }
}

export const MainSelectors = {
  nodeStarted: (state: RootState) => state.main.started,
  nodeState: (state: RootState) => state.main.nodeState
}
export default actions
