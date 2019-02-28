import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { View, Text } from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import styles from './Styles'
import { NodeState } from '@textile/react-native-sdk';

class Home extends Component<StateProps> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.props.nodeState} local node</Text>
      </View>
    )
  }
}

interface StateProps {
  nodeState: NodeState
}
const mapStateToProps = (state: RootState): StateProps => ({
  nodeState: state.main.nodeState
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): {} => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
