import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SuccessAnimationScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { message, details, returnTo = 'BottomNavigation', selectedLocation } = route.params || {};

  console.log(selectedLocation);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateAndNavigate = async () => {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace(returnTo, { selectedLocation });
        });
      }, 3000);
    };

    animateAndNavigate();
  }, []);

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>
        <LottieView
          source={require('../../assets/animations/success_animation.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />

        <Text style={styles.message}>{message}</Text>
        <Text style={styles.name}>{details}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // dimmed background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
  },
  animation: {
    width: 150,
    height: 150,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
    marginTop: 10,
  },
  name: {
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
    color: '#333',
  },
});
