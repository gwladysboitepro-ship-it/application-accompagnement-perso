import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const COLORS = [
  Colors.green, Colors.blue, Colors.orange, Colors.purple,
  Colors.gold, Colors.red, '#FFFFFF', '#FF69B4',
];

const PIECES = 60;

interface PieceProps {
  index: number;
}

function ConfettiPiece({ index }: PieceProps) {
  const x = useSharedValue(Math.random() * width);
  const y = useSharedValue(-20);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const color = COLORS[index % COLORS.length];
  const size = 8 + Math.random() * 8;
  const delay = Math.random() * 500;
  const duration = 2000 + Math.random() * 1000;
  const targetX = x.value + (Math.random() - 0.5) * 200;

  useEffect(() => {
    y.value = withDelay(delay, withTiming(height + 40, { duration, easing: Easing.in(Easing.quad) }));
    x.value = withDelay(delay, withTiming(targetX, { duration }));
    rotate.value = withDelay(delay, withTiming(720 + Math.random() * 720, { duration }));
    opacity.value = withDelay(delay + duration * 0.7, withTiming(0, { duration: duration * 0.3 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        },
        style,
      ]}
    />
  );
}

export function Confetti() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PIECES }, (_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
