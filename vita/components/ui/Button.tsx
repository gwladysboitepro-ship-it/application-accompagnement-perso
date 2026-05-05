import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../../constants/theme';

type Variant = 'green' | 'blue' | 'ghost' | 'red' | 'gold' | 'orange' | 'purple';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const SHADOW_HEIGHT = 4;

const variantStyles: Record<Variant, { bg: string; shadow: string; text: string }> = {
  green: { bg: Colors.green, shadow: Colors.greenDark, text: '#FFFFFF' },
  blue: { bg: Colors.blue, shadow: Colors.blueDark, text: '#FFFFFF' },
  ghost: { bg: 'transparent', shadow: 'transparent', text: Colors.textSecondary },
  red: { bg: Colors.red, shadow: '#CC3A3A', text: '#FFFFFF' },
  gold: { bg: Colors.gold, shadow: '#CC9E00', text: '#131F24' },
  orange: { bg: Colors.orange, shadow: '#CC7800', text: '#FFFFFF' },
  purple: { bg: Colors.purple, shadow: '#A660CC', text: '#FFFFFF' },
};

export function Button({
  label,
  onPress,
  variant = 'green',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const pressed = useSharedValue(0);
  const v = variantStyles[variant];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * SHADOW_HEIGHT }],
  }));

  const shadowAnimStyle = useAnimatedStyle(() => ({
    height: SHADOW_HEIGHT - pressed.value * SHADOW_HEIGHT,
  }));

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 20, stiffness: 400 });
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.wrapper, fullWidth && styles.fullWidth, style]}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: isDisabled ? Colors.textMuted : v.bg },
          animStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text} />
        ) : (
          <Text style={[styles.label, { color: v.text }, textStyle]}>{label}</Text>
        )}
      </Animated.View>
      {variant !== 'ghost' && (
        <Animated.View
          style={[
            styles.shadow,
            { backgroundColor: isDisabled ? '#333' : v.shadow },
            shadowAnimStyle,
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    letterSpacing: 0.3,
  },
  shadow: {
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    width: '100%',
  },
});
