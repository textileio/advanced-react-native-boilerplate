import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from 'react-native'

import {
  material,
  materialColors,
  systemWeights
} from 'react-native-typography'

interface Style {
  applicationView: ViewStyle
  header: ViewStyle
  container: ViewStyle
  title: TextStyle
  statusText: TextStyle
  hashText: TextStyle
  ipfs: ViewStyle
  imageView: ViewStyle
}

const styles = StyleSheet.create<Style>({
  applicationView: {
    flex: 1
  },
  container: {
    flex: 1
  },
  header: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    ...systemWeights.thin,
    color: 'black',
    fontSize: 32
  },
  statusText: {
    ...systemWeights.thin,
    color: 'black',
    fontSize: 12
  },
  hashText: {
    ...systemWeights.thin,
    color: 'black',
    fontSize: 8
  },
  ipfs: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 30
  },
  imageView: {
    flex: 1,
    width: '100%',
    height: 180,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default styles
