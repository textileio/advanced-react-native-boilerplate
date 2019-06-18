import { Linking, Platform } from 'react-native'
import { Store } from 'redux'
import { RootState } from '../Redux/Types'
import MainActions from '../Redux/MainRedux'

export default class DeepLinkEventHandler {
  store: Store<RootState>

  constructor(store: Store<RootState>) {
    this.store = store
  }

  handleIOS(event: any) {
    this.handleUrl(event.url)
  }

  getTagDispatch = (id: string) => {
    return () => {
      this.store.dispatch(MainActions.tagged(
        id
      ))
    }
  }
  getInviteDispatch = (id: string, key: string) => {
    return () => {
      this.store.dispatch(MainActions.newInvite(
        id, key
      ))
    }
  }
  handleUrl(url: string | null) {
    if (url) {
      const path = url.split('#')
      if (path.length < 2) {
        return
      }
      const idKey = path[1].split('::')
      if (idKey.length === 2 && idKey[0] === 'tagged') {
        // These are invites
        const dispatch = this.getTagDispatch(idKey[1])
        setTimeout(dispatch, 1400)

      } else if (idKey.length === 2) {
        const dispatch = this.getInviteDispatch(idKey[0], idKey[1])
        setTimeout(dispatch, 1400)
        // These are invites
      }
    }
  }

  setup() {
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleUrl(url)
      }
    }).catch(err => console.error('An error occurred', err))
    Linking.addEventListener('url', this.handleIOS.bind(this))
  }

  tearDown() {
    if (Platform.OS !== 'android') {
      Linking.removeEventListener('url', this.handleIOS)
    }
  }
}
