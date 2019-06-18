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

class ChooseName extends React.Component<DispatchProps> {
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
          onPress={this.submitDisplayName}
        >
          <Text style={styles.buttonLabel}>Save</Text>
        </TouchableOpacity>
      </View>
    )
  }

  submitDisplayName = () => {
    this.props.setDisplayName(this.state.text)
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
  setDisplayName: (name: string) => void
}
function mapDispatchToProps(dispatch: Dispatch<RootAction>): DispatchProps {
  return {
    setDisplayName: (name) => {
      dispatch(
        MainActions.setDisplayName(name)
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChooseName)
