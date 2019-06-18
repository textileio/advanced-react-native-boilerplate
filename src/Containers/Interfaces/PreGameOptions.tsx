import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Image,
  Text,
  FlatList,
  ListRenderItemInfo,
  TextInput,
  TouchableOpacity
} from 'react-native'
import { RootAction, RootState } from '../../Redux/Types'
import styles from '../Styles'
import MainActions, { NodeState, Status } from '../../Redux/MainRedux'

interface InputProps {
  owner: boolean
  memberCount: number
  invite: () => void
  leave: () => void
}
class StartOrJoinGame extends React.Component<InputProps & DispatchProps> {

  startButton = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.button}
        onPress={this.start}
      >
        <Text style={styles.buttonLabel}>Start</Text>
      </TouchableOpacity>
    )
  }

  leaveButton = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.button}
        onPress={this.leave}
      >
        <Text style={styles.buttonLabel}>Leave</Text>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={styles.options}>
        {this.props.memberCount === 0 && this.props.owner && this.leaveButton()}
        {this.props.memberCount > 0 && this.props.owner && this.startButton()}
        {this.props.memberCount > 0 && !this.props.owner && this.leaveButton()}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.invite}
        >
          <Text style={styles.buttonLabel}>Invite</Text>
        </TouchableOpacity>
      </View>
    )
  }

  start = () => {
    this.props.startGame()
  }
  invite = () => {
    this.props.invite()
  }
  leave = () => {
    this.props.leave()
  }
}

interface StateProps {
}

function mapStateToProps(state: RootState): {} {
  return {
  }
}

interface DispatchProps {
  startGame: () => void
}
function mapDispatchToProps(dispatch: Dispatch<RootAction>): DispatchProps {
  return {
    startGame: () => {
      dispatch(
        MainActions.startGame()
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StartOrJoinGame)
