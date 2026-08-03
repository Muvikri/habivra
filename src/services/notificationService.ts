import { LocalNotifications } from '@capacitor/local-notifications'

const DAILY_REMINDER_ID = 1001

export const notificationService = {
  async scheduleDailyReminder(hour: number, minute: number) {
    try {
      if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new Error('Waktu pengingat tidak valid.')
      }

      let permission = await LocalNotifications.checkPermissions()
      if (permission.display === 'prompt') permission = await LocalNotifications.requestPermissions()
      if (permission.display !== 'granted') return false

      await LocalNotifications.createChannel({
        id: 'habit-reminders',
        name: 'Pengingat Habit',
        importance: 5,
        description: 'Notifikasi pengingat harian untuk habit',
      })

      await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] })
      await LocalNotifications.schedule({
        notifications: [{
          id: DAILY_REMINDER_ID,
          title: 'Saatnya menjalankan habit',
          body: 'Satu aksi kecil hari ini memberi dampak besar untuk bumi.',
          schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
          extra: { type: 'daily-reminder' },
          channelId: 'habit-reminders',
        }],
      })

      return true
    } catch (error) {
      console.error('Notification schedule failed:', error)
      return false
    }
  },

  async cancelDailyReminder() {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] })
    } catch (error) {
      console.error('Notification cancel failed:', error)
    }
  },
}
