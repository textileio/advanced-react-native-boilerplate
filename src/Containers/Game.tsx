import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity
} from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import MainActions, { NodeState, Status, GameInfo, Tags } from '../Redux/MainRedux'
import { IContact, Thread, IExternalInvite } from '@textile/js-types'
import LeaveModal from './Interfaces/LeaveModal'
import InviteModal from './Interfaces/InviteModal'
import { NavigationScreenProps } from 'react-navigation'
import ItCard from './Interfaces/ItCard'
import numbersToWords from 'number-to-words'

class Game extends React.Component<StateProps & DispatchProps & NavigationScreenProps> {
  state = {
    text: '',
    inviteModal: false,
    leaveDialog: false
  }
  interval: any
  scrollTimer: any
  flatlist: any
  statusDot = () => {
    const color = this.props.nodeState === 'started' ? this.props.online ? '#2ECC40' : '#FFDC00' : '#FF4136'
    return (
      <View
        style={{
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: 5,
          shadowColor: 'red',
          shadowOpacity: 1,
          shadowRadius: 20
        }}
      />
    )
  }
  keyExtractor = (item: any, index: number) => String(index)

  itCard = () => {
    return (
      <View style={styles.containerIt}>
        <View style={styles.header}>
          {this.statusDot()}
        </View>
        <ItCard viewChat={this.viewChat} timeLeft={this.props.timeLeft} secondsLeft={this.props.secondsLeft}/>
      </View>
    )
  }
  scrollToEnd = () => {
    if (this.flatlist && this.flatlist.scrollToEnd) {
      this.flatlist.scrollToEnd()
    }
  }
  scrollDown = () => {
    this.scrollTimer = setTimeout(this.scrollToEnd.bind(this), 500)
  }

  render() {
    if (this.props.selfIt && this.props.secondsLeft > 0 && this.props.contacts > 1) {
      return this.itCard()
    }
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {this.statusDot()}
          <View style={styles.headerStatus}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={this.viewPlayers}
            >
              <Text style={{...styles.headerText, marginVertical: 10}}>
                {this.props.contacts} in game
              </Text>
            </TouchableOpacity>
            <Text style={{...styles.headerText, marginVertical: 10}}>
              {this.props.timeLeft} left
            </Text>
          </View>
        </View>


        <View style={styles.console}>
          <FlatList
            style={{flex: 1, paddingBottom: 1}}
            initialNumToRender={40}
            maxToRenderPerBatch={1}
            data={this.props.gameLog}
            renderItem={this.renderConsole}
            keyExtractor={this.keyExtractor}
            ListHeaderComponent={this.footerText}
            inverted={true}
            scrollEnabled={true}
            ref={ref => this.flatlist = ref}
          />
        </View>
        {this.renderButtons()}

        <LeaveModal
          isVisible={this.state.leaveDialog}
          cancelLeave={this.cancelLeave}
          leaveGame={this.leaveGame}
        />
        <InviteModal
          isVisible={this.state.inviteModal && !!this.props.gameInvite}
          closeModal={this.closeModal}
        />

        
      </View>
    )
  }
  viewPlayers = () => {
    this.props.navigation.navigate({routeName: 'Players'})
  }
  closeModal = () => {
    this.setState({inviteModal: false})
  }
  leaveDialog = () => {
    this.setState({leaveDialog: true})
  }
  leaveAfterDelay = () => {
    this.props.navigation.navigate({routeName: 'Home'})
  }
  leaveGame = () => {
    this.setState({leaveDialog: false})
    this.props.leaveGame()
    setTimeout(this.leaveAfterDelay.bind(this), 800)
  }
  cancelLeave = () => {
    this.setState({leaveDialog: false})
  }
  renderButtons = () => {
    return (
      <View style={styles.options}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.leaveDialog}
        >
          <Text style={styles.buttonLabel}>Quit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.viewChat}
        >
          <Text style={styles.buttonLabel}>Chat</Text>
        </TouchableOpacity>
        {this.props.secondsLeft > 0 && 
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={this.showInvite}
            >
              <Text style={styles.buttonLabel}>Invite</Text>
          </TouchableOpacity>
        }
        {this.props.secondsLeft <= 0 && 
          <TouchableOpacity
              activeOpacity={0.85}
              style={styles.button}
              onPress={this.restartGame}
            >
              <Text style={styles.buttonLabel}>Rematch</Text>
          </TouchableOpacity>
        }
      </View>
    )
  }

  viewChat = () => {
    this.props.navigation.navigate({routeName: 'Chat'})
  }

  restartGame = () => {
    this.props.restartGame()
  }

  showInvite = () => {
    this.setState({inviteModal: true})
    this.props.newInvite()
  }
  rematchCount(nTh: number) {
    const text: string = numbersToWords.toWordsOrdinal(nTh)
    if (text.length < 2) {
      return text.toUpperCase()
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  renderConsole = (row: ListRenderItemInfo<any>) => {
    const { item } = row
    const { profile } = this.props
    let tagger = item.tagger.name
    let tagged = item.tagged.name
    if (profile && profile.address == item.tagger.address) {
      tagger = 'You'
    }
    if (profile && profile.address == item.tagged.address) {
      tagged = 'You'
    }
    const rematchText = tagger === 'You' ? 'You are it!' : `${tagger} lost, so they're it!`
    const text = item.restart ? 
                  `${this.rematchCount(item.restart)} rematch! ${rematchText}` :
                  item.start ? 
                    tagger === 'You' ?
                      'You are it!' : 
                      `` :
                    `${tagger} tagged ${tagged}`
    return (
      <Text style={styles.consoleText}>
        {text}
      </Text>
    )
  }
  footerText = () => {
    const who = this.props.gameInfo && this.props.gameInfo.currentIt ? this.props.gameInfo.currentIt.name + ' is it!' : ''
    const loser = this.props.gameInfo && this.props.gameInfo.currentIt ? this.props.gameInfo.currentIt.name + ' lost!' : ''
    const text = this.props.secondsLeft <= 0 ? `Game over! ${loser}` : `Run! ${who}`
    return (
      <Text style={styles.consoleText}>
        {text}
      </Text>
    )
  }
  componentDidUpdate(prevProps) {
    if (prevProps.selfIt !== this.props.selfIt) {
      if (this.state.inviteModal || this.state.leaveDialog) {
        if (this.props.selfIt) {
          this.setState({inviteModal: false, leaveDialog: false})
        }
      }
    }
  }
  componentWillMount() {
    this.interval  = setInterval(this.refreshGame, 10000);
  }
  componentDidMount() {
    this.refreshGame()
  }
  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
  }
  refreshGame = () => {
    this.props.refreshGameInfo()
  }
}

interface StateProps {
  secondsLeft: number
  timeLeft: string
  contacts: number
  nodeState: NodeState
  online: boolean
  gameLog: Tags[]
  profile?: IContact
  gameThread?: Thread
  gameInfo: GameInfo
  creatingGame?: boolean
  gameInvite?: IExternalInvite
  selfIt: boolean
}

function mapStateToProps(state: RootState): StateProps {
  const contacts = state.main.gameInfo.contacts ? state.main.gameInfo.contacts.length + 1 : 1
  const now = Math.round((new Date()).getTime() / 1000)
  const start = state.main.gameInfo.seconds ? state.main.gameInfo.seconds : 0
  const duration = state.main.gameInfo.duration
  const secondsLeft = Math.max(start + duration - now, 0)
  const hours = Math.floor(secondsLeft / 3600)
  let minutes = String(Math.floor((secondsLeft - (hours * 3600)) / 60))
  minutes = minutes.length < 2 ? `0${minutes}` : minutes
  const timeLeft = `${hours}:${minutes}`
  
  const gameLog = [...state.main.gameLog].reverse()
  return {
    secondsLeft,
    timeLeft,
    contacts,
    nodeState: state.main.nodeState,
    online: state.main.online,
    gameLog,
    profile: state.main.profile,
    gameThread: state.main.gameThread,
    gameInfo: state.main.gameInfo,
    creatingGame: state.main.creatingGame,
    selfIt: state.main.gameInfo.currentIt && state.main.profile && state.main.gameInfo.currentIt.address == state.main.profile.address,
    gameInvite: state.main.gameInvite
  }
}

interface DispatchProps {
  newInvite: () => void
  leaveGame: () => void
  refreshGameInfo: () => void
  restartGame: () => void
}
function mapDispatchToProps(dispatch: Dispatch<RootAction>): DispatchProps {
  return {
    newInvite: () => {
      dispatch(
        MainActions.generateNewInvite()
      )
    },
    leaveGame: () => {
      dispatch(
        MainActions.leaveGame()
      )
    },
    refreshGameInfo: () => {
      dispatch(
        MainActions.refreshGameInfoRequest()
      )
    },
    restartGame: () => {
      dispatch(
        MainActions.restartGame()
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Game)
