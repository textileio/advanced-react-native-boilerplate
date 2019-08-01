import { createAppContainer, createSwitchNavigator, createBottomTabNavigator } from 'react-navigation'

import Home from '../Containers/Home'
import Game from '../Containers/Game'
import Players from '../Containers/Players'
import Chat from '../Containers/Chat'
import QRScanner from '../Containers/QRScanner'

const nav = createSwitchNavigator(
  {
    Home,
    Game,
    Players,
    Chat,
    QRScanner
  },
  {
    initialRouteName: 'Home'
  }
)

const app = createAppContainer(nav)

export default app
