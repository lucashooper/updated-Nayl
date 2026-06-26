import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  opacity: number;
  speed: number;
  directionX: number;
  directionY: number;
  size: number;
}

interface StarfieldBackgroundProps {
  starCount?: number;
  style?: object;
}

const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  starCount = 70,
  style,
}) => {
  const [stars, setStars] = useState<Star[]>(() =>
    Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.12 + 0.02,
      directionX: (Math.random() - 0.5) * 0.8,
      directionY: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2 + 0.5,
    })),
  );

  const tick = useCallback(() => {
    setStars((prev) =>
      prev.map((star) => {
        let x = star.x + star.directionX * star.speed;
        let y = star.y + star.directionY * star.speed;

        if (x < -10) x = width + 10;
        if (x > width + 10) x = -10;
        if (y < -10) y = height + 10;
        if (y > height + 10) y = -10;

        return { ...star, x, y };
      }),
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(tick, 40);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {stars.map((star, index) => (
        <View
          key={index}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              opacity: star.opacity,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
});

export default StarfieldBackground;
