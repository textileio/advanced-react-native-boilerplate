import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { RootAction, RootState } from '../../Redux/Types'
import styles from '../Styles'
import QRCode from 'react-native-qrcode'

interface ScreenProps {
  timeLeft: string
  secondsLeft: number
  viewChat: () => void
}
class InviteModal extends React.Component<ScreenProps & StateToProps> {
  renderQR () {
    return (
      <View
        style={{overflow:'hidden', alignSelf: 'center', padding: 0, margin: 0, width: Dimensions.get('window').width * 0.75, backgroundColor: 'red', alignContent: 'center', justifyContent: 'center', alignItems: 'center', borderWidth: 0}}
      >
        <QRCode
          value={this.props.tagUrl}
          size={Dimensions.get('window').width * 0.75}
          bgColor={'black'}
          fgColor={'red'}
          style={{backgroundColor: 'red'}}
        />
      </View>
    )
  }
  renderInstructions = () => {
    return (
      <View style={{flex: 0.35, margin: 10, marginTop: 20, alignContent: 'flex-start'}}>
        <Text style={styles.consoleTextIt}>1. Show this screen to anyone playing and they are it.</Text>
        <Text style={styles.consoleTextIt}>2. Have them point their native camera app at this code to notify the network.</Text>
        <Text style={styles.consoleTextIt}>3. Run!</Text>
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonIt}
            onPress={this.props.viewChat}
          >
            <Text style={{...styles.buttonLabel, lineHeight: 40, color: 'black'}}>Chat</Text>
        </TouchableOpacity>
      </View>
    )
  }
  renderMinutes () {
    return (
      <View
        style={{overflow:'hidden', alignSelf: 'center', padding: 0, margin: 0, width: Dimensions.get('window').width * 0.75, backgroundColor: 'red', alignContent: 'center', justifyContent: 'center', alignItems: 'center', borderWidth: 0}}
      >
        <Text style={{fontSize: 190}}>
          {this.props.minutesInTimeout}
        </Text>
      </View>
    )
  }
  renderWaiting = () => {
    return (
      <View style={{flex: 0.35, margin: 10, marginTop: 20, alignContent: 'flex-start'}}>
        <Text style={styles.consoleTextIt}>Shoot, you've been tagged!</Text>
        <Text style={styles.consoleTextIt}>I can't be seen like this! You've gotta get rid of It.</Text>
        <Text style={styles.consoleTextIt}>But first, we have to wait {this.props.minutesInTimeout} minute{this.props.minutesInTimeout > 1 ? 's' : ''} before we get the code to tag the next person.</Text>
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonIt}
            onPress={this.props.viewChat}
          >
            <Text style={{...styles.buttonLabel, lineHeight: 40, color: 'black'}}>Chat</Text>
        </TouchableOpacity>
      </View>
    )
  }
  renderLostMessage = () => {
    return (
      <View style={{flex: 0.35, margin: 10, marginTop: 20, alignContent: 'flex-start'}}>
        <Text style={styles.consoleTextIt}>What were we thinking!?</Text>
        <Text style={styles.consoleTextIt}>There isn't enough time left in the game for us to get out of here...</Text>
        <Text style={styles.consoleTextIt}>Okay, let's try to stay positive and get 'em next time.</Text>
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonIt}
            onPress={this.props.viewChat}
          >
            <Text style={{...styles.buttonLabel, lineHeight: 40, color: 'black'}}>Chat</Text>
        </TouchableOpacity>
      </View>
    )
  }
  renderLost () {
    return (
      <View
        style={{overflow:'hidden', alignSelf: 'center', padding: 0, margin: 0, width: Dimensions.get('window').width * 0.75, backgroundColor: 'red', alignContent: 'center', justifyContent: 'center', alignItems: 'center', borderWidth: 0}}
      >
        <Text style={{fontSize: 100}}>
          YOU
        </Text>
        <Text style={{fontSize: 100}}>
          LOST!
        </Text>
      </View>
    )
  }
  render() {
    const lost = this.props.secondsLeft <= this.props.secondsInTimeout
    return (
      <View
        style={styles.console}
      >
        <View style={{flex: 0.1, marginHorizontal: 10, marginBottom: 8, alignContent: 'center'}}>
          <Text style={styles.consoleTextIt}>{this.props.timeLeft} REMAINING. YOU ARE IT!</Text>
        </View>

        <View style={{flex:0.5, alignContent: 'center', justifyContent: 'center', backgroundColor: 'red'}}>
          {lost && this.renderLost()}
          {!lost && this.props.minutesInTimeout <= 0 && this.renderQR()}
          {!lost && this.props.minutesInTimeout > 0 && this.renderMinutes()}
        </View>
        {!lost && this.props.minutesInTimeout <= 0 && this.renderInstructions()}
        {!lost && this.props.minutesInTimeout > 0 && this.renderWaiting()}
        {lost && this.renderLostMessage()}
      </View>
    )
  }
}

interface StateToProps {
  tagUrl: string
  lastTag: number
  minutesInTimeout: number
  secondsInTimeout: number
}

function mapStateToProps(state: RootState): StateToProps {
  const { profile } = state.main
  const { address } = profile
  const tagUrl = address ? `https://t.txtl.us/tag#tagged::${address}` : 'https://textile.io/?whoops!'
  const now = Math.round((new Date()).getTime() / 1000)
  const lastTag = state.main.gameInfo.lastTag ? state.main.gameInfo.lastTag : now
  const secondsInTimeout = ( (lastTag + 60 * 5) - now )
  const minutesInTimeout = Math.ceil( secondsInTimeout / 60 ) // timeout lasts for 10 minutes
  return {
    tagUrl,
    lastTag,
    minutesInTimeout,
    secondsInTimeout
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): {} {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteModal)
