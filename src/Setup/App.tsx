import React, { Component } from 'react'
import { Provider } from 'react-redux'
import RootContainer from './RootContainer'
import configureStore from '../Redux/configureStore'
import MainActions from '../Redux/MainRedux'

import Textile, {Events as TextileEvents} from '@textile/react-native-sdk'

const { store } = configureStore()

class App extends Component {

  textile = Textile
  events = new TextileEvents()

  render () {
    return (
      <Provider store={store}>
          <RootContainer />
      </Provider>
    )
  }

  componentDidMount () {
    this.events.addListener('NODE_ONLINE', () => {
      store.dispatch(MainActions.nodeOnline())
    })
    this.events.addListener('newNodeState', (payload) => {
      store.dispatch(MainActions.newNodeState(payload.state))
      console.info('@textile/newNodeState', payload.state)
    })
    this.textile.setup({
      MINIMUM_SLEEP_MINUTES: 10,
      RUN_BACKGROUND_TASK: () => false
    })
  }

  componentWillUnmount () {
    this.textile.tearDown()
  }
}

export default App
