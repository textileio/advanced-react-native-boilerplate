import { createAppContainer, createSwitchNavigator, createBottomTabNavigator } from 'react-navigation'

import Home from '../Containers/Home'
import Game from '../Containers/Game'
import Players from '../Containers/Players'
import Chat from '../Containers/Chat'

const nav = createSwitchNavigator(
  {
    Home,
    Game,
    Players,
    Chat
  },
  {
    initialRouteName: 'Home'
  }
)

const app = createAppContainer(nav)

export default app
