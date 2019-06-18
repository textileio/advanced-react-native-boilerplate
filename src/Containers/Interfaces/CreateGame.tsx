import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native'
import { RootAction, RootState } from '../../Redux/Types'
import styles from '../Styles'
import MainActions, { NodeState, Status } from '../../Redux/MainRedux'

class CreateGame extends React.Component<DispatchProps> {
  state = {
    text: ''
  }

  render() {
    return (
      <View style={styles.options}>
        <TextInput
          autoFocus={true}
          style={{...styles.button, color: '#00FF00', flex: 1.4, marginHorizontal: 2}}
          keyboardAppearance={'dark'}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        >
        </TextInput>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.createNewGame}
        >
          <Text style={styles.buttonLabel}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.cancel}
        >
          <Text style={styles.buttonLabel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }

  createNewGame = () => {
    this.props.createNewGame(this.state.text)
    this.setState({text: ''})
  }
  cancel = () => {
    this.props.cancelCreate()
  }
}

interface StateProps {
}

function mapStateToProps(state: RootState): {} {
  return {
  }
}

interface DispatchProps {
  createNewGame: (name: string) => void
  cancelCreate: () => void
}
function mapDispatchToProps(dispatch: Dispatch<RootAction>): DispatchProps {
  return {
    createNewGame: (name) => {
      dispatch(
        MainActions.createNewGameSuccess(name)
      )
    },
    cancelCreate: () => {
      dispatch(
        MainActions.createNewGameCancel()
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateGame)
