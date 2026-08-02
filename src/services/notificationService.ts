import { LocalNotifications } from '@capacitor/local-notifications'

export const notificationService = {
  async scheduleDailyReminder(hour: number, minute: number) {
    const permission = await LocalNotifications.requestPermissions()
    if (permission.display !== 'granted') return false
    await LocalNotifications.cancel({ notifications: [{ id: 1001 }] })
    await LocalNotifications.schedule({
      notifications: [{
        id: 1001,
        title: 'Saatnya menjalankan habit',
        body: 'Satu aksi kecil hari ini memberi dampak besar untuk bumi.',
        schedule: { on: { hour, minute }, repeats: true },
      }],
    })
    return true
  },
  cancelDailyReminder: () => LocalNotifications.cancel({ notifications: [{ id: 1001 }] }),
}
