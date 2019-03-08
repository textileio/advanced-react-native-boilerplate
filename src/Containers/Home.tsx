import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import { NodeState } from '@textile/react-native-sdk'

class Home extends React.Component<StateProps> {
  render() {
    const previewText = !this.props.online ? 'waiting to come online...' : this.props.ipfsImage === undefined ? 'requesting ipfs hash...' : 'ipfs request complete'
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{this.props.nodeState} local node</Text>
        </View>
        <View style={styles.ipfs}>
          <TouchableOpacity
            style={styles.imageView}
            onPress={this.viewFile}
          >
            {this.ipfsImage()}
            {this.props.ipfsImage && <Text style={styles.hashText}>QmTgtbb4LckHaXh1YhpNcBu48cFY8zgT1Lh49q7q7ksf3M</Text>}
          </TouchableOpacity>
          <Text style={styles.statusText}>{previewText}</Text>
        </View>
      </View>
    )
  }
  viewFile = () => {
    Linking.openURL('https://ipfs.io/ipfs/QmTgtbb4LckHaXh1YhpNcBu48cFY8zgT1Lh49q7q7ksf3M/raster-generated/ipfs-logo-256-ice.png')
  }
  ipfsImage = () => {
    if (this.props.ipfsImage) {
      return (
        <Image
          style={{width: 150, height: 150, resizeMode: 'cover'}}
          source={{uri: this.props.ipfsImage}}
        />
      )
    }
    return (<View/>)
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
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
