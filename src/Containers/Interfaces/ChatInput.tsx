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
import MainActions from '../../Redux/MainRedux'

interface ScreenProps {
  navigateHome: () => void
}
class ChatInput extends React.Component<DispatchProps & ScreenProps> {
  state = {
    text: ''
  }

  render() {
    return (
      <View style={styles.options}>
        <TextInput
          style={{...styles.button, color: '#00FF00', flex: 2.5, marginHorizontal: 2}}
          keyboardAppearance={'dark'}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.submitMessage}
        >
          <Text style={styles.buttonLabel}>Send</Text>
        </TouchableOpacity>
      </View>
    )
  }

  submitMessage = () => {
    if (this.state.text === '') {
      return
    }
    this.props.sendMessage(this.state.text)
    if (this.state.text === '/leave') {
      this.setState({text: ''})
      this.props.navigateHome()
    }
    this.setState({text: ''})
  }
}


function mapStateToProps(state: RootState): {} {
  return {
  }
}

interface DispatchProps {
  sendMessage: (text: string) => void
}
function mapDispatchToProps(dispatch: Dispatch<RootAction>): DispatchProps {
  return {
    sendMessage: (text) => {
      dispatch(
        MainActions.sendMessage(text)
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatInput)
