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

class SetDuration extends React.Component<DispatchProps> {
  state = {
    text: ''
  }

  render() {
    return (
      <View style={styles.options}>
        <TextInput
          keyboardType={'numeric'}
          autoFocus={true}
          style={{...styles.button, color: '#00FF00', marginHorizontal: 2}}
          keyboardAppearance={'dark'}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        >
        </TextInput>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.setDuration}
        >
          <Text style={styles.buttonLabel}>Done</Text>
        </TouchableOpacity>
      </View>
    )
  }

  setDuration = () => {
    const value = parseInt(this.state.text)
    this.props.setDuration((value  * 3600))
    this.setState({text: ''})
  }
}

interface StateProps {
}

function mapStateToProps(state: RootState): {} {
  return {
  }
}

interface DispatchProps {
  setDuration: (seconds: number) => void
}
function mapDispatchToProps(dispatch: Dispatch<RootAction>): DispatchProps {
  return {
    setDuration: (seconds) => {
      dispatch(
        MainActions.setGameDurationRequest(seconds)
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetDuration)
