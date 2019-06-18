import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Clipboard
} from 'react-native'
import { RootAction, RootState } from '../../Redux/Types'
import styles from '../Styles'
import Modal from 'react-native-modal'
import QRCode from 'react-native-qrcode'

interface InputProps {
  isVisible: boolean
  closeModal: () => void
}
class JoinModal extends React.Component<InputProps & StateToProps> {

  shareUrl = () => {
    Clipboard.setString(this.props.inviteURL)
  }
  render() {
    return (
      <Modal
        isVisible={this.props.isVisible}
        animationIn={'fadeInUp'}
        animationOut={'fadeOutDown'}
        backdropOpacity={1}
        avoidKeyboard={true}
        style={{...styles.console, paddingTop: 10}}
      >
        <View style={{flex:0.5, alignContent: 'center', justifyContent: 'center'}}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={{overflow:'hidden', alignSelf: 'center', padding: 0, margin: 0, width: Dimensions.get('window').width * 0.75, backgroundColor: 'black', alignContent: 'center', justifyContent: 'center', alignItems: 'center', borderWidth: 0}}
            onLongPress={this.shareUrl}
          >
            <QRCode
              value={this.props.inviteURL}
              size={Dimensions.get('window').width * 0.75}
              bgColor={'#00FF00'}
              fgColor={'black'}
              style={{backgroundColor: 'black'}}
            />

          </TouchableOpacity>
        </View>
        <View style={{flex: 0.3, margin: 10, alignContent: 'flex-start'}}>
          <Text style={styles.consoleText}>1. This is your super secret invite.</Text>
          <Text style={styles.consoleText}>2. Have anyone you want to join the game by first installing this app on their phone.</Text>
          <Text style={styles.consoleText}>3. Have them point their native camera at this invite</Text>
          <Text style={styles.consoleText}>4. They should see a link to open this app and they are off to the races!</Text>
        </View>
        <View style={{flex: 0.2, backgroundColor: 'black', margin: 10, alignContent: 'flex-end'}}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={this.props.closeModal}
          >
          <Text style={styles.buttonLabel}>I'm done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }
}

interface StateToProps {
  inviteURL: string
}

function mapStateToProps(state: RootState): StateToProps {
  const inviteURL = state.main.gameInvite ? `https://t.txtl.us/invite#${state.main.gameInvite.id}::${state.main.gameInvite.key}` : 'https://textile.io/?oops'
  return {
    inviteURL
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): {} {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JoinModal)
