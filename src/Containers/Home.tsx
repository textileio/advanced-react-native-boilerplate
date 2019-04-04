import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { View, Text, Image, TouchableOpacity, Linking, Dimensions } from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import { NodeState } from '@textile/react-native-sdk'
import TextileImage from '@textile/react-native-textile-image'

const IPFS_PIN = 'QmTgtbb4LckHaXh1YhpNcBu48cFY8zgT1Lh49q7q7ksf3M/raster-generated/ipfs-logo-256-ice.png'

class Home extends React.Component<StateProps> {
  render() {
    const previewText = !this.props.online ? 'waiting to come online...' : this.props.ipfsImage === undefined ? 'requesting ipfs hash...' : 'ipfs request complete'
    // if (this.props.online) {
    //   return this.renderPanZoom()
    // }
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{this.props.nodeState} local node</Text>
        </View>
        <View style={styles.ipfs}>

            {this.props.ipfsImage && this.renderImage()}

          <Text style={styles.statusText}>{previewText}</Text>
        </View>
      </View>
    )
  }

  renderImage = () => {
    return (
      <TextileImage
        style={{ width: 150, height: 150}}
        target={IPFS_PIN}
        ipfs={true}
        resizeMode={'cover'}
      />
    )
  }
}

interface StateProps {
  nodeState: NodeState
  online: boolean
  ipfsImage?: string
}
const mapStateToProps = (state: RootState): StateProps => ({
  nodeState: state.main.nodeState,
  online: state.main.online,
  ipfsImage: state.main.ipfsImage
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): {} => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
