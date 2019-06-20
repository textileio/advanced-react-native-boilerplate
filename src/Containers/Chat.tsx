import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  FlatList,
  ListRenderItemInfo,
  KeyboardAvoidingView,
  TouchableHighlight,
  Keyboard,
  AppState,
  Platform
} from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import MainActions, { ContactJoin } from '../Redux/MainRedux'
import { IText } from '@textile/js-types'
import { NavigationScreenProps } from 'react-navigation'
import ChatInput from './Interfaces/ChatInput'

class Chat extends React.Component<StateProps & DispatchProps & NavigationScreenProps> {
  state = {
    text: '',
    keyboard: 'closed'
  }
  scrollTimer: any
  flatlist: any
  keyboardDidShowListener: any
  keyboardDidHideListener: any

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

  scrollToEnd = () => {
    if (this.flatlist && this.flatlist.scrollToEnd) {
      this.flatlist.scrollToEnd()
    }
  }
  scrollDown = () => {
    this.scrollTimer = setTimeout(this.scrollToEnd.bind(this), 50)
  }
  renderChatContents = () => {
    return (
      <View style={styles.console}>
        <FlatList
          style={{flex: 0.9, paddingBottom: 1}}
          initialNumToRender={40}
          windowSize={30}
          inverted={true}
          maxToRenderPerBatch={1}
          data={this.props.chat}
          renderItem={this.renderConsole}
          keyExtractor={this.keyExtractor}
          scrollEnabled={true}
          ref={ref => this.flatlist = ref}
        />
      </View>
    )
  }
  render = () => {
    // <KeyboardAvoidingView style={styles.container} behavior={this.state.keyboard === 'opened' ? 'height' : 'padding'}>
    return (
      <KeyboardAvoidingView style={styles.container} behavior={this.state.keyboard === 'opened' ? 'height' : 'padding'}>
        {this.backButton()}
        {this.renderChatContents()}
        <ChatInput navigateHome={this.navigateHome}/>
      </KeyboardAvoidingView>
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
    if (item.join) {
      return (
        <View>
          <Text style={{...styles.consoleChat, color: '#565656'}}>{name} joined the game</Text>
        </View>
      )
    } else {
      if (item.sameAsLast) {
        return (
          <View>
            <Text style={styles.consoleChat}>{item.body}</Text>
          </View>
        )
      }
      return (
        <View>
          <Text style={styles.consoleChatUser}>{name} wrote: </Text>
          <Text style={styles.consoleChat}>{item.body}</Text>
        </View>
      )
    }
  }
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
    AppState.addEventListener('change', this.handleAppStateChange)
  }
  componentDidMount() {
    this.refreshMessages()
  }
  componentWillUnmount() {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
    AppState.removeEventListener('change', this.handleAppStateChange)
  }
  _keyboardDidShow = () => {
    if (Platform.OS === 'android'){
      this.setState({
          keyboard: 'opened'
      })
    }
  }

  handleAppStateChange = () => {
    Keyboard.dismiss()
  }

  _keyboardDidHide = () => {
    this.setState({
      keyboard: 'closed'
    });
  }
  refreshMessages = () => {
    this.props.refreshMessages()
  }
}

interface ITextPlus extends IText {
  sameAsLast?: boolean
}
interface StateProps {
  address: string
  chat: ChatFeed[]
}

interface ChatFeed {
  address: string
  name: string
  body: string
  date: number
  chat?: IText
  join?: ContactJoin
  sameAsLast?: boolean
}
function mapStateToProps(state: RootState): StateProps {
  let last = ''
  const contacts = state.main.gameInfo.contacts ? state.main.gameInfo.contacts : []
  const chats = state.main.chat ? state.main.chat : []
  const merge: ChatFeed[] = [
    ...contacts.map((c) => {
      return {join: c, address: c.address, name: c.name, body: 'joined', date: c.join}
    }),
    ...chats.map((c) => {
      return {chat: c, address: c.user.address, name: c.user.name, body: c.body, date: c.date.seconds as number}
    })
  ].sort((a, b) => (a.date > b.date) ? 1 : -1)
  // Initially it's earliest first ^
  
  const chat = merge.map((m) => {
    if (m.chat) {
      const sameAsLast = last === m.chat.user.address
      last = m.chat.user.address
      return {...m, sameAsLast}
    }
    last = ''
    return m
  }).reverse()
  // ^ we reverse them again so they are chrono in the inverted flatlist above

  return {
    address: state.main.profile ? state.main.profile.address : '',
    chat
  }
}

interface DispatchProps {
  refreshMessages: () => void
}
function mapDispatchToProps(dispatch: Dispatch<RootAction>): DispatchProps {
  return {
    refreshMessages: () => {
      dispatch(
        MainActions.refreshChatRequest()
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat)
