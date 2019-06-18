import { StyleSheet, TextStyle, ViewStyle, ImageStyle, Platform } from 'react-native'

import {
  material,
  materialColors,
  systemWeights
} from 'react-native-typography'

const fontFamily = Platform.OS === 'ios' ? 'American Typewriter' : 'monospace'

interface Style {
  applicationView: ViewStyle
  container: ViewStyle
  containerIt: ViewStyle
  header: ViewStyle
  headerStatus: ViewStyle
  headerText: TextStyle
  console: ViewStyle
  consoleText: TextStyle
  consoleChat: TextStyle
  consoleChatUser: TextStyle
  consoleTextIt: TextStyle
  options: ViewStyle
  button: ViewStyle
  buttonIt: ViewStyle
  buttonLabel: TextStyle
}

const styles = StyleSheet.create<Style>({
  applicationView: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: Platform.OS === 'ios' ? 40 : 4,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 15,
    backgroundColor: 'black',
  },
  containerIt: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 15,
    backgroundColor: 'red',
  },
  header: {
    justifyContent: 'flex-start',
    marginTop: 10
  },
  headerStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  headerText: {
    fontFamily,
    color: '#00FF00',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 8
  },
  console: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  consoleText: {
    fontFamily,
    color: '#00FF00',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 8
  },
  consoleChat: {
    fontFamily,
    color: '#00FF00',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 8
  },
  consoleChatUser: {
    fontFamily,
    color: '#00FF00',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 8
  },
  consoleTextIt: {
    fontFamily,
    color: 'black',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 8
  },
  options: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    borderColor: '#00FF00',
    borderWidth: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  buttonIt: {
    borderColor: 'black',
    borderWidth: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginVertical: 30
  },
  buttonLabel: {
    fontFamily,
    color: '#00FF00',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center'
  }
})

export default styles
