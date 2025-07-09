import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import StackNavigation from './src/Navigation/StackNavigation'
import { AuthProvider } from './src/Context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <StackNavigation />
    </AuthProvider>
  );
};

export default App

const styles = StyleSheet.create({})


// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <NewAppScreen templateFileName="App.tsx" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;
