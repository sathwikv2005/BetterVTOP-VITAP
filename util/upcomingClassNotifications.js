import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const ANDROID_CHANNEL_ID = 'class-reminders'

export async function setupNotificationChannel() {
	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
			name: 'Class Reminders',
			importance: Notifications.AndroidImportance.HIGH,
			sound: true,
		})
	}
}

export async function requestNotificationPermission() {
	const { status } = await Notifications.requestPermissionsAsync()
	return status === 'granted'
}

export async function scheduleClassReminders(timetableObj) {
	const now = new Date()
	const dayName = now.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()
	const today = timetableObj?.timetable?.find((d) => d.day === dayName)
	if (!today || !today.classes) return

	// Load already scheduled classes from AsyncStorage
	const scheduledClassesJSON = await AsyncStorage.getItem('scheduledClassNotifications')
	const scheduledClasses = scheduledClassesJSON ? JSON.parse(scheduledClassesJSON) : []

	const newScheduledClasses = [...scheduledClasses]

	for (const cls of today.classes) {
		if (!cls.timings || cls.timings.length === 0) continue

		const timing = cls.timings
		const [hour, minute] = timing.start.split(':').map(Number)
		const classTime = new Date()
		classTime.setHours(hour)
		classTime.setMinutes(minute)
		classTime.setSeconds(0)

		const triggerTime = new Date(classTime.getTime() - 15 * 60 * 1000)

		if (triggerTime <= new Date()) continue

		const todayDate = now.toISOString().split('T')[0]
		const classKey = `${todayDate}-${cls.courseCode}-${timing.start}`

		if (scheduledClasses.includes(classKey)) {
			continue
		}

		await Notifications.scheduleNotificationAsync({
			content: {
				title: `⏰ Class Reminder!`,
				body: `📖 ${cls.courseTitle} (${cls.slot})\n🏫 ${cls.venue}\n🕘 ${timing.start}.\nDon’t be late! 😄`,
				sound: true,
				priority: Notifications.AndroidNotificationPriority.MAX,
			},
			trigger: {
				type: 'date',
				date: triggerTime,
			},
			channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
		})

		newScheduledClasses.push(classKey)
	}

	await AsyncStorage.setItem('scheduledClassNotifications', JSON.stringify(newScheduledClasses))
}

const BACKGROUND_TASK = 'reschedule-class-notifications'

TaskManager.defineTask(BACKGROUND_TASK, async () => {
	try {
		const now = new Date()
		console.log('[BG Task] Running at', now.toISOString())

		if (!isMidnightWindow()) {
			console.log('[BG Task] Skipped (not midnight window)')
			return BackgroundFetch.Result.NoData
		}

		console.log('[BG Task] Rescheduling classes for the new day')
		await AsyncStorage.removeItem('scheduledClassNotifications')

		const notiEnabled = await AsyncStorage.getItem('upcomingClassNotiEnabled')
		if (notiEnabled === 'false') return BackgroundFetch.Result.NoData

		const timetableJSON = await AsyncStorage.getItem('timetable')
		if (!timetableJSON) return BackgroundFetch.Result.NoData

		const timetable = JSON.parse(timetableJSON)
		await Notifications.cancelAllScheduledNotificationsAsync()
		await scheduleClassReminders(timetable)

		return BackgroundFetch.Result.NewData
	} catch (err) {
		console.error('[BG Task] Failed:', err)
		return BackgroundFetch.Result.Failed
	}
})

// Start the background rescheduling
export async function startAutoReschedule() {
	const status = await BackgroundFetch.getStatusAsync()
	if (status === BackgroundFetch.Status.Available) {
		await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
			minimumInterval: 15 * 60,
			startOnBoot: true,
			stopOnTerminate: false,
		})
		console.log('🔄 Background rescheduler started')
	}
}

function isMidnightWindow() {
	const now = new Date()
	return now.getHours() === 0 && now.getMinutes() < 15
}
