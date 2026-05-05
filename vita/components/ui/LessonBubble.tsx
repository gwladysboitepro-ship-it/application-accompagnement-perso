import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Radius } from '../../constants/theme';

type BubbleState = 'done' | 'active' | 'locked';

interface LessonBubbleProps {
  icon: string;
  state: BubbleState;
  xp?: number;
  onPress?: () => void;
  position?: 'left' | 'center' | 'right';
}

const stateConfig: Record<BubbleState, { bg: string; border: string; iconOpacity: number }> = {
  done: { bg: Colors.green, border: Colors.greenDark, iconOpacity: 1 },
  active: { bg: Colors.blue, border: Colors.blueDark, iconOpacity: 1 },
  locked: { bg: Colors.surface, border: Colors.border, iconOpacity: 0.4 },
};

export function LessonBubble({ icon, state, xp, onPress, position = 'center' }: LessonBubbleProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (state === 'active') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [state]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.3 * pulse.value,
    transform: [{ scale: 1 + 0.15 * pulse.value }],
  }));

  const config = stateConfig[state];
  const marginLeft = position === 'left' ? 0 : position === 'right' ? 80 : 40;

  return (
    <TouchableOpacity
      onPress={state !== 'locked' ? onPress : undefined}
      activeOpacity={state === 'locked' ? 1 : 0.8}
      style={[styles.wrapper, { marginLeft }]}
    >
      {state === 'active' && (
        <Animated.View style={[styles.pulseRing, { borderColor: Colors.blue }, pulseStyle]} />
      )}
      <View
        style={[
          styles.bubble,
          { backgroundColor: config.bg, borderColor: config.border },
        ]}
      >
        <Text style={[styles.icon, { opacity: config.iconOpacity }]}>{icon}</Text>
      </View>
      {state === 'locked' && (
        <Text style={styles.lock}>🔒</Text>
      )}
      {xp && state !== 'locked' && (
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{xp} XP</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  bubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  icon: {
    fontSize: 28,
  },
  lock: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    fontSize: 16,
  },
  xpBadge: {
    marginTop: 4,
    backgroundColor: Colors.gold + '22',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  xpText: {
    color: Colors.gold,
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
  },
});
