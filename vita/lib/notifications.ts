import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyNotifications(userName: string, streakCount: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Rappel repas midi
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🍽️ Logger ton repas',
      body: `${userName}, n'oublie pas de logger ton déjeuner !`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });

  // Rappel repas soir
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Bilan de la journée',
      body: `${userName}, n'oublie pas de logger ton dîner et ton sommeil !`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });

  // Hydratation 15h
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Hydratation',
      body: 'Tu as bien pensé à boire de l\'eau aujourd\'hui ?',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 15,
      minute: 0,
    },
  });

  // Streak 21h
  await Notifications.scheduleNotificationAsync({
    content: {
      title: streakCount > 0 ? `🔥 Ton streak de ${streakCount}j est en danger !` : '🌿 VITA t\'attend !',
      body: 'Fais au moins 1 action pour maintenir ta progression.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });

  // Motivation matin 8h
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚡ Jour ${streakCount + 1} !`,
      body: `${userName}, chaque jour te rapproche de ton objectif 💪`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}

export async function sendBadgeNotification(badgeName: string, xp: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🏅 Nouveau badge débloqué !`,
      body: `Tu as gagné "${badgeName}" ! +${xp} XP`,
    },
    trigger: null,
  });
}
