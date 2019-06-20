import React, { Component } from 'react'
import { Provider } from 'react-redux'
import RootContainer from './RootContainer'
import configureStore from '../Redux/configureStore'
import MainActions from '../Redux/MainRedux'
import DeepLinkEventHandler from './DeepLinkEventHandler'

import Textile, { EventSubscription, FeedItemType } from '@textile/react-native-sdk'
import { NavigationScreenProps } from 'react-navigation'

const { store } = configureStore()
class App extends Component<NavigationScreenProps> {
  textile = Textile
  subscriptions: EventSubscription[] = []
  deepLinkEventHandler = new DeepLinkEventHandler(store)

  render() {
    return (
      <Provider store={store}>
        <RootContainer />
      </Provider>
    )
  }

  componentDidMount() {
    // this.props.navigation.navigate()
    this.deepLinkEventHandler.setup()
    this.subscriptions.push(
      Textile.events.addNodeStartedListener(() => {
        store.dispatch(MainActions.newNodeState('started'))
      })
    )
    this.subscriptions.push(
      Textile.events.addNodeStoppedListener(() => {
        store.dispatch(MainActions.newNodeState('stopped'))
      })
    )
    this.subscriptions.push(
      Textile.events.addNodeFailedToStartListener(error => {
        store.dispatch(MainActions.newNodeState('error'))
      })
    )
    this.subscriptions.push(
      Textile.events.addNodeOnlineListener(() => {
        store.dispatch(MainActions.nodeOnline())
      })
    )
    this.subscriptions.push(
      Textile.events.addThreadUpdateReceivedListener((threadId, feedItemData) => {
        if (
          feedItemData.type === FeedItemType.Join ||
          feedItemData.type === FeedItemType.Leave
          ) {
            store.dispatch(MainActions.refreshContacts(threadId))
        }
        if (
          feedItemData.type === FeedItemType.Files ) {
            console.log(threadId, threadId)
            store.dispatch(MainActions.refreshGameInfo(threadId))
        }
        if ( 
          feedItemData.type === FeedItemType.Text
        ) {
          store.dispatch(MainActions.refreshMessagesRequest(threadId, feedItemData.value))
        }
      })
    )
  }

  componentWillUnmount() {
    for (const subscription of this.subscriptions) {
      subscription.cancel()
    }
    this.deepLinkEventHandler.tearDown()
  }
}

export default App
