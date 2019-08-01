import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Image } from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import { View, Text, TouchableOpacity } from 'react-native'
import MainActions from '../Redux/MainRedux'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { NavigationScreenProps } from 'react-navigation'
import styles from './Styles'

interface StateProps {
}

interface DispatchProps {
  tagged: (id: string) => void
  newInvite: (id: string, key: string) => void
}

type Props = StateProps & DispatchProps

class Scanner extends Component<Props & NavigationScreenProps> {
  state = {  }

  onSuccess = (e: any) => {
    // this.props.scanNewQRCodeSuccess(e.data)
    console.log(e.data)
    const { data } = e
    if (data) {
      const path = data.split('#')
      if (path.length < 2) {
        return
      }
      const idKey = path[1].split('::')
      if (idKey.length === 2 && idKey[0] === 'tagged') {
        // These are invites
        this.props.tagged(idKey[1])

      } else if (idKey.length === 2) {
        this.props.newInvite(idKey[0], idKey[1])
      }
    }
    this.navHome()
  }
  navHome = () => {
    this.props.navigation.navigate({routeName: 'Home'})
  }

  render() {
    return (
      <View style={styles.containerNoPadding}>
        <View style={{flex: 1}}>
          <QRCodeScanner
            onRead={this.onSuccess}
            topContent={<Text style={{color: '#00FF00'}}>SCAN QR CODE</Text>}
            cameraProps={{ captureAudio: false }}
            showMarker={true}
            bottomContent={
              <View style={styles.options}>
                <TouchableOpacity
                  onPress={this.navHome}
                  style={{...styles.button, flex: 0.5}}
                >
                <Text style={{color: '#00FF00'}}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
  // accounts: []
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
  return {
    tagged: (id: string) => dispatch(MainActions.tagged(id)),
    newInvite: (id: string, key: string) => dispatch(MainActions.newInvite(id, key))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Scanner)