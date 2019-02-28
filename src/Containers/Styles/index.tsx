import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  ImageStyle
} from 'react-native'

import { material, materialColors, systemWeights } from 'react-native-typography'

interface Style {
  applicationView: ViewStyle
  container: ViewStyle
  title: TextStyle
}

const styles = StyleSheet.create<Style>({
  applicationView: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    ...systemWeights.thin,
    color: 'black',
    fontSize: 32
  }
})

export default styles
