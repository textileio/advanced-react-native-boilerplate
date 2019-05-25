import React, { Component } from 'react'
import { Provider } from 'react-redux'
import RootContainer from './RootContainer'
import configureStore from '../Redux/configureStore'
import MainActions from '../Redux/MainRedux'

import Textile, { EventSubscription } from '@textile/react-native-sdk'

const { store } = configureStore()

class App extends Component {
  textile = Textile
  subscriptions: EventSubscription[] = []
  render() {
    return (
      <Provider store={store}>
        <RootContainer />
      </Provider>
    )
  }

  componentDidMount() {
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
  }

  componentWillUnmount() {
    for (const subscription of this.subscriptions) {
      subscription.cancel()
    }
  }
}

export default App
