import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';

export default function SuccessAnimationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const { message, details, returnTo = 'BottomNavigation', selectedLocation } = route.params || {};

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
      <Animated.View style={[styles.modal, { opacity: fadeAnim, backgroundColor: colors.card }]}>
        <LottieView
          source={require('../../assets/animations/success_animation.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />

        <Text style={[globalStyles.subtitle, { color: colors.success }]}>{message}</Text>
        <Text style={[globalStyles.content, globalStyles.mt_5]}>{details}</Text>
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
});
