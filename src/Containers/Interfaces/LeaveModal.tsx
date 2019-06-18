import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import { RootAction, RootState } from '../../Redux/Types'
import styles from '../Styles'
import Modal from 'react-native-modal';

interface InputProps {
  isVisible: boolean
  cancelLeave: () => void
  leaveGame: () => void
}
class LeaveModal extends React.Component<InputProps> {

  render() {
    return (
      <Modal
        isVisible={this.props.isVisible}
        animationIn={'fadeInUp'}
        animationOut={'fadeOutDown'}
        avoidKeyboard={true}
        backdropOpacity={1}
        style={styles.console}
      >
        <View style={{flex: 0.3, margin: 10, alignContent: 'flex-start'}}>
          <Text style={styles.consoleText}>Quitting?</Text>
          <Text style={styles.consoleText}>Are you sure you want to leave?</Text>
          <Text style={styles.consoleText}>This can only be undone by getting a new invite to the game.</Text>
        </View>
        <View style={{flex: 0.2, margin: 10, alignContent: 'flex-end'}}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={this.props.cancelLeave}
          >
            <Text style={styles.buttonLabel}>Go back</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 0.2, margin: 10, alignContent: 'flex-end'}}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={this.props.leaveGame}
          >
            <Text style={styles.buttonLabel}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }
}

interface StateProps {
}

function mapStateToProps(state: RootState): {} {
  return {
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): {} {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LeaveModal)
