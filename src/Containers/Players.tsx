import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableHighlight,
  Platform
} from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import MainActions, { ContactJoin } from '../Redux/MainRedux'
import { IText } from '@textile/js-types'
import { NavigationScreenProps } from 'react-navigation'
import ChatInput from './Interfaces/ChatInput'

class Users extends React.Component<StateProps & NavigationScreenProps> {
  flatlist: any
  backButton = () => {
    return (
      <TouchableHighlight
        style={{
          flex: 0.1,
          paddingTop: 16,
          paddingBottom: 8,
          paddingHorizontal: 8,
          backgroundColor: 'black',
          alignContent: 'flex-start',
          justifyContent: 'flex-start',
          alignItems: 'flex-start'
        }}
        onPress={this.backToGame.bind(this)}
      >
        <Text style={styles.buttonLabel}>← Back</Text>
      </TouchableHighlight>
    )
  }

  keyExtractor = (item: any, index: number) => String(index)

  renderContent = () => {
    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={'padding'}>
        {this.backButton()}
        <View style={styles.console}>
          
          <FlatList
            style={{flex: 0.9, paddingBottom: 1}}
            data={this.props.contacts}
            renderItem={this.renderConsole}
            keyExtractor={this.keyExtractor}
            scrollEnabled={true}
            ref={ref => this.flatlist = ref}
            onContentSizeChange={() => setTimeout(() => this.flatlist.scrollToEnd(), 200)}
            onLayout={() => this.flatlist.scrollToEnd({animated: true})}
          />
          </View>
        </KeyboardAvoidingView>
      )
    } else {
      return (
        <View style={{flex: 1}}>
        {this.backButton()}
        <View style={styles.console}>
          
          <FlatList
            style={{flex: 0.9, paddingBottom: 1}}
            data={this.props.contacts}
            renderItem={this.renderConsole}
            keyExtractor={this.keyExtractor}
            scrollEnabled={true}
            ref={ref => this.flatlist = ref}
            onContentSizeChange={() => setTimeout(() => this.flatlist.scrollToEnd(), 200)}
            onLayout={() => this.flatlist.scrollToEnd({animated: true})}
          />
          </View>
        </View>
      )
    }
  }
  render() {
    return (
      <View style={styles.container}>
        {this.renderContent()}
      </View>
    )
  }

  navigateHome = () => {
    this.props.navigation.navigate({routeName: 'Home'})
  }
  backToGame = () => {
    this.props.navigation.navigate({routeName: 'Game'})
  }
  
  renderConsole = (row: ListRenderItemInfo<any>) => {
    const { item } = row
    const name = this.props.address === item.address ? 'You' : item.name
    return (
      <View>
        <Text style={{...styles.consoleChat, color: '#00FF00'}}>{name} <Text style={{...styles.consoleChat, color: '#565656'}}>joined the game</Text></Text>
      </View>
    )
  }

}

interface StateProps {
  address: string
  contacts: ContactJoin[]
}

function mapStateToProps(state: RootState): StateProps {
  let last = ''
  const contacts = state.main.gameInfo.contacts ? state.main.gameInfo.contacts : []

  return {
    address: state.main.profile ? state.main.profile.address : '',
    contacts
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): {} {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Users)
