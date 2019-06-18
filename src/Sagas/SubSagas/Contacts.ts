import { takeLatest, put, call, select } from 'redux-saga/effects'
import { ActionType } from 'typesafe-actions'
import MainActions, {MainSelectors, ContactJoin} from '../../Redux/MainRedux'
import Textile, { Thread, IContactList }  from '@textile/react-native-sdk'

export function* refreshContacts(action: ActionType<typeof MainActions.refreshContacts>) {
  const { threadId } = action.payload
  const gameThread = yield select(MainSelectors.gameThread)
  if (gameThread && gameThread.id === threadId) {
    yield call(refreshGameContacts, gameThread)    
  }
}

export function* refreshGameContacts(thread: Thread) {
  try {
    const known = yield select(MainSelectors.contacts)
    const knownContacts = known ? known : []
    const knownAddresses: string[] = knownContacts.map((k) => k.address)
    const contacts: IContactList = yield call([Textile.threads, 'peers'], thread.id)
    const newAddresses: string[] = contacts.items.map((k) => k.address)
    
    const startSeconds = 0
    const profile = yield select(MainSelectors.profile)
    if (profile) {
      if (knownAddresses.indexOf(profile.address) === -1 && newAddresses.indexOf(profile.address) > -1) {
        const join: ContactJoin = {...profile, join: startSeconds}
        yield put(MainActions.newContactJoin(join))
      }
    }
    const chats = yield select(MainSelectors.chat)
    const seconds = chats.length === 0 ?
    startSeconds :
      Math.max.apply(Math, chats.map((c) => { return c.date.seconds as number }))

    let newContacts = 0
    for (const contact of contacts.items) {
      if (knownAddresses.indexOf(contact.address) === -1) {
        newContacts += 1
        // work around for https://github.com/textileio/go-textile/issues/827
        let { name } = contact
        if (name.length === 48) {
          if (contact.avatar) {
            name = contact.avatar
          } else if (contact.peers.length > 0) {
            name = contact.peers[0].avatar
          }
        }
        const join: ContactJoin = {...contact, name, join: seconds}
        yield put(MainActions.newContactJoin(join))
        try {
          yield call([Textile.contacts, 'add'], contact)
        } catch (error) {
          // pass
        }
      }
    }

    // remove any that have left
    for (const known of knownContacts) {
      if (newAddresses.indexOf(known.address) === -1) {
        yield put(MainActions.newContactLeave(known))
      }
    }

    if (newContacts > 0) {
      const s = contacts.items.length !== 0 ? 's' : ''
      yield put(MainActions.pushNewMessage(
        {type: 'text', message: `The game now has ${contacts.items.length + 1} player${s}`}
      ))
    }
    return contacts
  } catch (error) {
    //pass
  }
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* initContactsSagas() {
  yield takeLatest('REFRESH_CONTACTS', refreshContacts)
}
