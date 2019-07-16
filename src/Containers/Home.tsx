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
  Platform
} from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import MainActions, { NodeState, Status, GameInfo } from '../Redux/MainRedux'
import { IContact, Thread, IExternalInvite } from '@textile/js-types'
import ChooseName from './Interfaces/ChooseName'
import StartOrJoinGame from './Interfaces/StartOrJoinGame'
import CreateGame from './Interfaces/CreateGame'
import PreGameOptions from './Interfaces/PreGameOptions'
import LeaveModal from './Interfaces/LeaveModal'
import InviteModal from './Interfaces/InviteModal'
import { NavigationScreenProps } from 'react-navigation'
import SetDuration from './Interfaces/SetDuration'

class Home extends React.Component<StateProps & DispatchProps & NavigationScreenProps> {
  state = {
    text: '',
    inviteModal: false,
    leaveDialog: false
  }
  interval: any
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

  renderHeader = () => {
    return (
      <View style={styles.header}>
        {this.statusDot()}
      </View>
    )
  }
  renderContent = () => {
    return (
      <View style={styles.console}>
        <FlatList
          style={{flex: 1, paddingBottom: 1}}
          inverted={true}
          data={this.props.statusUpdates}
          renderItem={this.renderConsole}
          keyExtractor={this.keyExtractor}
          ListHeaderComponent={this.footerText}
        />
      </View>
      )
  }
  render() {
    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView style={styles.container} behavior={'padding'}>

          {this.renderHeader()}
          {this.renderContent()}

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
          
        </KeyboardAvoidingView>
      )
    }
    return (
      <View style={styles.container}>

        {this.renderHeader()}
        {this.renderContent()}

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
  footerText = () => {
    if (this.props.settingDuration) {
      return (
        <Text style={styles.consoleText}>
          How many hours should this game last?
        </Text>
      )
    }
    if (this.props.online && !this.props.profile) {
      return (
        <Text style={styles.consoleText}>
          Choose your display name.
        </Text>
      )
    }
    if (!this.props.gameInfo.started && !this.props.creatingGame && !!this.props.gameThread && !this.props.settingDuration) {
      const text = this.props.gameInfo.contacts && this.props.gameInfo.contacts.length > 0 ? 
        this.props.gameInfo.owner ? 'Start the game whenever you are ready.' : 'Waiting for creator to start the game.' :
        'Invite more people before you start the game.'
      return (
        <Text style={styles.consoleText}>
          {text}
        </Text>
      )
    }
    return (
      <View/>
    )
  }
  closeModal = () => {
    this.setState({inviteModal: false})
  }
  leaveDialog = () => {
    this.setState({leaveDialog: true})
  }
  leaveGame = () => {
    this.setState({leaveDialog: false})
    this.props.leaveGame()
  }
  cancelLeave = () => {
    this.setState({leaveDialog: false})
  }
  renderEmpty = () => {
    return (
      <View style={styles.options}/>
    )
  }
  renderButtons = () => {
    if (!this.props.online) {
      return this.renderEmpty()
    }
    // First, you need to pick a name
    if (!this.props.profile) {
      return (
        <ChooseName />
      )
    }
    // Next, create or join a game
    if (!this.props.gameThread && !this.props.creatingGame) {
      return (
        <StartOrJoinGame join={this.joinGame} />
      )
    }
    // If create, pick a name of game
    if ( this.props.creatingGame ) {
      return (
        <CreateGame />
      )
    }
    // If create, pick a name of game
    if ( this.props.settingDuration ) {
      return (
        <SetDuration />
      )
    }

    // Now you are in a game, do stuff
    if (!this.props.gameInfo.started) {
      const memberCount = this.props.gameInfo.contacts ? this.props.gameInfo.contacts.length : 0
      return (
        <PreGameOptions
          owner={!!this.props.gameInfo.owner}
          memberCount={memberCount}
          invite={this.showInvite}
          leave={this.leaveDialog}
        />
      )
    }

    // Now you are in a game, do stuff
    if ( this.props.gameInfo.started ) {
      return (
        <View style={styles.options}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.button}
            onPress={this.enterGame}
          >
            <Text style={styles.buttonLabel}>Enter</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.renderEmpty()
  }

  enterGame = () => {
    this.props.navigation.navigate({routeName: 'Game'})
  }

  joinGame = () => {
    this.props.navigation.navigate({routeName: 'QRScanner'})
  }

  showInvite = () => {
    this.setState({inviteModal: true})
    this.props.newInvite()
  }

  renderConsole = (row: ListRenderItemInfo<any>) => {
    const { item } = row
    return (
      <Text style={styles.consoleText}>
        {item.message}
      </Text>
    )
  }

  componentWillMount() {
    this.interval  = setInterval(this.refreshGame, 10000);
  }
  componentDidMount() {
    this.refreshGame()
  }
  componentWillUnmount() {
    if (this.interval) {
      clearTimeout(this.interval)
    }
  }
  refreshGame = () => {
    if (this.props.gameThread) {
      this.props.refreshRequest()
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.gameInfo.started !== this.props.gameInfo.started && this.props.gameInfo.started === true) {
      this.props.navigation.navigate({routeName: 'Game'})
    }
  }
}

interface StateProps {
  nodeState: NodeState
  online: boolean
  statusUpdates: Status[]
  profile?: IContact
  gameThread?: Thread
  gameInfo: GameInfo
  creatingGame?: boolean
  settingDuration?: boolean
  gameInvite?: IExternalInvite
}

function mapStateToProps(state: RootState): StateProps {
  const members = state.main.gameInfo.members ? state.main.gameInfo.members.length : 0
  return {
    nodeState: state.main.nodeState,
    online: state.main.online,
    statusUpdates: [...state.main.statusUpdates].reverse(),
    profile: state.main.profile,
    gameThread: state.main.gameThread,
    gameInfo: state.main.gameInfo,
    creatingGame: state.main.creatingGame,
    gameInvite: state.main.gameInvite,
    settingDuration: state.main.settingDuration
  }
}

interface DispatchProps {
  newInvite: () => void
  leaveGame: () => void
  refreshRequest: () => void
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
    refreshRequest: () => {
      dispatch(
        MainActions.refreshGameInfoRequest()
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
