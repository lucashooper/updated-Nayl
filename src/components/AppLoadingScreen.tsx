import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AppLoadingScreen: React.FC = () => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [opacity, translateY]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.View style={[styles.content, contentStyle]}>
        <Image
          source={require('../../assets/cosmic-nail-nobg.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>Nayl</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: 24,
  },
  brandName: {
    fontFamily: 'Inter',
    fontSize: 52,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default AppLoadingScreen;
