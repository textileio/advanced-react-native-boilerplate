import React, { Component } from 'react'
import { View, StatusBar, Platform } from 'react-native'
import { NavigationContainerComponent } from 'react-navigation'
import Navigation from '../Navigation'
import NavigationService from '../Navigation/Service'
import styles from '../Containers/Styles'

class App extends Component<{}> {
  render() {
    return (
      <View style={styles.applicationView}>
        <StatusBar barStyle={'light-content'} />
        <Navigation
          ref={(navRef: NavigationContainerComponent) => {
            NavigationService.setTopLevelNavigator(navRef)
          }}
        />
      </View>
    )
  }
}

export default App
