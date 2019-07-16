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
import { IContact } from '@textile/js-types'

interface InputProps {
  join: () => void
}
class StartOrJoinGame extends React.Component<InputProps & DispatchProps> {
  state = {
    text: '',
    join: false
  }

  render() {
    return (
      <View style={styles.options}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.join}
          disabled={this.state.join}
        >
          <Text style={styles.buttonLabel}>Join</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.create}
        >
        <Text style={styles.buttonLabel}>Create</Text>
        </TouchableOpacity>
      </View>
    )
  }

  join = () => {
    this.props.join()
    // this.setState({join: true})
  }
  create = () => {
    this.props.createNewGame()
  }
}

interface StateProps {
}

function mapStateToProps(state: RootState): {} {
  return {
  }
}

interface DispatchProps {
  // joinGame: () => void
  createNewGame: () => void
}
function mapDispatchToProps(dispatch: Dispatch<RootAction>): DispatchProps {
  return {
    // joinGame: () => {
    //   dispatch(
    //     MainActions.joinGame()
    //   )
    // },
    createNewGame: () => {
      dispatch(
        MainActions.createNewGame()
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StartOrJoinGame)
