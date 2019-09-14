import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  View,
  Text,
  Image,
} from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import { NodeState } from '../Redux/MainRedux'

class Home extends React.Component<StateProps> {
  render() {
    const previewText = !this.props.online
      ? 'waiting to come online...'
      : this.props.ipfsImage == null
      ? 'requesting ipfs hash...'
      : 'ipfs request complete'
    // if (this.props.online) {
    //   return this.renderPanZoom()
    // }
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            local node state: {this.props.nodeState}
          </Text>
        </View>
        <View style={styles.ipfs}>
          <Text style={styles.statusText}>{previewText}</Text>
          {this.props.ipfsImage && this.renderImage()}
        </View>
      </View>
    )
  }

  renderImage = () => {
    console.log(this.props.ipfsImage)
    return (
      <Image
        style={{ width: 150, height: 150, marginTop: 20 }}
        source={{ uri: this.props.ipfsImage }}
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
function mapStateToProps(state: RootState): StateProps {
  return {
    nodeState: state.main.nodeState,
    online: state.main.online,
    ipfsImage: state.main.ipfsImage
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): {} {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
