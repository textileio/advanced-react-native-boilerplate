import { createAction, ActionType, getType } from 'typesafe-actions'
import { RootState } from './Types'
import { IContact, Thread, IExternalInvite, IText } from '@textile/react-native-sdk'

const actions = {
  refreshContacts: createAction('REFRESH_CONTACTS', resolve => {
    return (threadId: string) => resolve({ threadId })
  }),
  refreshGameInfo: createAction('REFRESH_GAME', resolve => {
    return (threadId: string) => resolve({ threadId })
  }),
  refreshGameInfoRequest: createAction('REFRESH_GAME_REQUEST'),
  nodeOnline: createAction('NODE_ONLINE'),
  newNodeState: createAction('NEW_NODE_STATE', resolve => {
    return (nodeState: NodeState) => resolve({ nodeState })
  }),
  cafeRegistrationSuccess: createAction('CAFE_REGISTRATION_SUCCESS'),
  setDisplayName: createAction('SET_DISPLAY_NAME', resolve => {
    return (displayName: string) => resolve({ displayName })
  }),
  updatePeerId: createAction('UPDATE_PEERID', resolve => {
    return (peerId: string) => resolve({ peerId })
  }),
  updateProfile: createAction('UPDATE_PROFILE', resolve => {
    return (profile: IContact) => resolve({ profile })
  }),
  pushNewMessage: createAction('PUSH_NEW_MESSAGE', resolve => {
    return (message: Status) => resolve({ message })
  }),
  joinGame: createAction('JOIN_GAME'),
  createNewGame: createAction('CREATE_NEW_GAME'),
  createNewGameSuccess: createAction('CREATE_NEW_GAME_SUCCESS', resolve => {
    return (name: string) => resolve({ name })
  }),
  createNewGameCancel: createAction('CREATE_NEW_GAME_CANCEL'),
  setCurrentGame: createAction('SET_CURRENT_GAME', resolve => {
    return (thread: Thread) => resolve({ thread })
  }),
  newContactJoin: createAction('NEW_CONTACT_JOIN', resolve => {
    return (contact: ContactJoin) => resolve({ contact })
  }),
  newContactLeave: createAction('NEW_CONTACT_LEAVE', resolve => {
    return (contact: ContactJoin) => resolve({ contact })
  }),
  generateNewInvite: createAction('GENERATE_NEW_INVITE'),
  generateNewInviteSuccess: createAction('GENERATE_NEW_INVITE_SUCCESS', resolve => {
    return (invite: IExternalInvite) => resolve({ invite })
  }),
  startGame: createAction('START_GAME'),
  restartGame: createAction('RESTART_GAME'),
  startGameSuccess: createAction('START_GAME_SUCCESS', resolve => {
    return (seconds: number) => resolve({ seconds })
  }),
  setGameDuration: createAction('SET_GAME_DURATION', resolve => {
    return (seconds: number) => resolve({ seconds })
  }),
  setGameDurationRequest: createAction('SET_GAME_DURATION_REQUEST', resolve => {
    return (seconds: number) => resolve({ seconds })
  }),
  setCurrentIt: createAction('SET_CURRENT_IT', resolve => {
    return (contact: IContact) => resolve({ contact })
  }),
  leaveGame: createAction('LEAVE_GAME'),
  leaveGameSuccess: createAction('LEAVE_GAME_SUCCESS'),
  newTag: createAction('NEW_TAG', resolve => {
    return (tagger: IContact, tagged: IContact, id: string, date: number, start?: boolean, restart?: number) => resolve({ tagger, tagged, id, date, start, restart })
  }),
  updateMessages: createAction('UPDATE_MESSAGES', resolve => {
    return (messages: IText[]) => resolve({ messages })
  }),
  sendMessage: createAction('SEND_MESSAGES', resolve => {
    return (text: string) => resolve({ text })
  }),
  newInvite: createAction('NEW_INVITE', resolve => {
    return (id: string, key: string) => resolve({ id, key })
  }),
  refreshMessagesRequest: createAction('REFRESH_MESSAGES_REQUEST', resolve => {
    return (threadId: string, message: IText) => resolve({ threadId, message })
  }),
  refreshChatRequest: createAction('REFRESH_CHAT_REQUEST'),
  tagged: createAction('TAGGED', resolve => {
    return (tagger: string) => resolve({ tagger })
  })
}

export type MainActions = ActionType<typeof actions>

export type NodeState = 'started' | 'stopped' | 'starting' | 'unknown' | 'error'

export interface Status {
  type: string
  message: string
}

export interface ContactJoin extends IContact {
  join: number
}

export interface GameInfo {
  started: boolean
  duration: number
  lastTag?: number
  seconds?: number
  currentIt?: IContact
  owner?: boolean
  contacts?: ContactJoin[]
}

export interface Tags {
  tagger: IContact
  tagged: IContact
  id: string
  date: number
  start?: boolean
  restart?: number
}

export interface MainState {
  cafe?: boolean
  online: boolean
  nodeState: NodeState
  statusUpdates: Status[]
  profile?: IContact
  peerId?: string
  avatarSet?: boolean
  gameThread?: Thread
  creatingGame?: boolean
  settingDuration?: boolean
  gameInfo: GameInfo
  gameInvite?: IExternalInvite
  gameLog: Tags[]
  chat: IText[]
}

const initialState: MainState = {
  online: false,
  nodeState: 'stopped',
  statusUpdates: [],
  gameInfo: {started: false, duration: (24 * 3600)},
  gameLog: [],
  chat: [],
}

export function reducer(state = initialState, action: MainActions) {
  switch (action.type) {
    case getType(actions.leaveGame): {
      return { ...state, gameInfo: {started: false, duration: (24 * 3600)}}
    }
    case getType(actions.setGameDuration): {
      return { ...state, settingDuration: false, gameInfo: {...state.gameInfo, duration: action.payload.seconds}}
    }
    case getType(actions.leaveGameSuccess): {
      return { ...state, gameInfo: {}, gameInvite: undefined, gameThread: undefined, gameLog: [], chat: [] }
    }
    case getType(actions.nodeOnline): {
      return { ...state, online: true, nodeState: 'started' }
    }
    case getType(actions.newNodeState): {
      return { ...state, nodeState: action.payload.nodeState }
    }
    case getType(actions.cafeRegistrationSuccess): {
      return { ...state, cafe: true }
    }
    case getType(actions.setDisplayName): {
      const messages = [
        {type: 'text', message: `Oh, I like that. ${action.payload.displayName}`},
        {type: 'text', message: `Ok then "${action.payload.displayName}", here are the rules:`},
        {type: 'text', message: `1. Interplanetary Tag is meant to be played in a shared location.`},
        {type: 'text', message: `2. Games can only begin with 2 or more people, more can be invited at any time.`},
        {type: 'text', message: `3. The game creator is always It first.`},
        {type: 'text', message: `4. If you are shown a red card during the game, you are It and must scan the red card to keep playing the game..`},
        {type: 'text', message: `How would you like to begin?`},
      ]
      return { ...state, statusUpdates: [...state.statusUpdates, ...messages] }
    }
    case getType(actions.updateProfile): {
      return { ...state, profile: action.payload.profile}
    }
    case getType(actions.updatePeerId): {
      return { ...state, peerId: action.payload.peerId}
    }
    case getType(actions.pushNewMessage): {
      return { ...state, statusUpdates: [...state.statusUpdates, action.payload.message] }
    }
    case getType(actions.createNewGame): {
      const message1 = {type: 'text', message: `Nice, you seem like a real "go getter".`}
      const message2 = {type: 'text', message: `Each game needs a title. What's your game's title?`}
      return { ...state, creatingGame: true, statusUpdates: [...state.statusUpdates, message1, message2]}
    }
    case getType(actions.createNewGameSuccess): {
      return { ...state, settingDuration: true, creatingGame: false, gameInfo: {...state.gameInfo, owner: true}}
    }
    case getType(actions.createNewGameCancel): {
      const message = {type: 'text', message: `booooo.`}
      return { ...state, creatingGame: false, statusUpdates: [...state.statusUpdates, message]}
    }
    case getType(actions.setCurrentGame): {
      const message = {type: 'text', message: `You are playing in, ${action.payload.thread.name}.`}
      const owner = state.profile && action.payload.thread.initiator === state.profile.address
      return { ...state, creatingGame: false, gameInfo: {...state.gameInfo, owner}, gameThread: action.payload.thread, statusUpdates: [...state.statusUpdates, message]}
    }
    case getType(actions.newContactJoin): {
      const { contact } = action.payload
      const existing = state.gameInfo.contacts ? state.gameInfo.contacts : []
      return { ...state, gameInfo: {...state.gameInfo, contacts: [...existing, contact]}}
    }
    case getType(actions.newContactLeave): {
      const { contact } = action.payload
      const filtered = state.gameInfo.contacts ? state.gameInfo.contacts.filter((c) => c.address !== contact.address) : []
      return { ...state, gameInfo: {...state.gameInfo, contacts: filtered}}
    }
    case getType(actions.generateNewInviteSuccess): {
      return { ...state, gameInvite: action.payload.invite}
    }
    case getType(actions.startGameSuccess): {
      return { ...state, gameInfo: {...state.gameInfo, started: true, seconds: action.payload.seconds}}
    }
    case getType(actions.setCurrentIt): {
      return { ...state, gameInfo: {...state.gameInfo, currentIt: action.payload.contact}}
    }
    case getType(actions.newTag): {
      let newLogs: Tags[] = []
      if (state.gameLog.map((gl) => gl.id).indexOf(action.payload.id) > -1) {
        return state
      }
      if (action.payload.start) {
        newLogs = [action.payload, ...state.gameLog]
      } else {
        newLogs = [...state.gameLog, action.payload].sort((a, b) => (a.date > b.date) ? 1 : -1)
      }
      return { ...state, gameLog: newLogs, gameInfo: {...state.gameInfo, lastTag: action.payload.date}}
    }
    case getType(actions.refreshMessagesRequest): {
      return { ...state, chat: [...state.chat, action.payload.message]}
    }
    case getType(actions.updateMessages): {
      return { ...state, chat: action.payload.messages}
    }
    default:
      return state
  }
}

export const MainSelectors = {
  cafeRegistered: (state: RootState) => state.main.cafe,
  profile: (state: RootState) => state.main.profile,
  nodeOnline: (state: RootState) => state.main.online,
  nodeState: (state: RootState) => state.main.nodeState,
  gameThread: (state: RootState) => state.main.gameThread,
  gameInvite: (state: RootState) => state.main.gameInvite,
  gameStarted: (state: RootState) => state.main.gameInfo.started,
  startSeconds: (state: RootState) => state.main.gameInfo.seconds,
  contacts: (state: RootState) => state.main.gameInfo.contacts,
  currentIt: (state: RootState) => state.main.gameInfo.currentIt,
  duration: (state: RootState) => state.main.gameInfo.duration,
  chat: (state: RootState) => state.main.chat
}
export default actions
