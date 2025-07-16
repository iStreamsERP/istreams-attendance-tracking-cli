// firebaseConfig.js
import { initializeApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyC9MYNdJx5YyQ1ejXYkKEu48GKQnjhAZOw',
  authDomain: 'istreams-attendance-trac-314a3.firebasestorage.app',
  projectId: 'istreams-attendance-trac-314a3',
  storageBucket: 'istreams-attendance-trac-314a3.appspot.com',
  messagingSenderId: '554839029043',
  appId: '1:554839029043:android:6be79df51a4ace4437ba46',
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export { firebaseApp, messaging };