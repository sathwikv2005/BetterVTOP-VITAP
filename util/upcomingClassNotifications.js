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
	try {
		// Prevent concurrent scheduling (lock)
		const lock = await AsyncStorage.getItem('schedulingLock')
		if (lock === 'true') {
			console.log('[Scheduler] Another instance is already running — skipping')
			return
		}
		await AsyncStorage.setItem('schedulingLock', 'true')

		const now = new Date()
		const dayName = now.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()
		const today = timetableObj?.timetable?.find((d) => d.day === dayName)
		if (!today || !today.classes) {
			console.log('[Scheduler] No classes found for today')
			return
		}

		// Load already scheduled classes (use Set for deduplication)
		const scheduledClassesJSON = await AsyncStorage.getItem('scheduledClassNotifications')
		const scheduledSet = new Set(scheduledClassesJSON ? JSON.parse(scheduledClassesJSON) : [])

		let newCount = 0

		for (const cls of today.classes) {
			if (!cls.timings || cls.timings.length === 0) continue

			const timing = cls.timings
			const [hour, minute] = timing.start.split(':').map(Number)

			const classTime = new Date()
			classTime.setHours(hour, minute, 0, 0)

			const triggerTime = new Date(classTime.getTime() - 15 * 60 * 1000)
			if (triggerTime <= now) continue // skip past classes

			const todayDate = now.toISOString().split('T')[0]
			const classKey = `${todayDate}-${cls.courseCode}-${timing.start}`

			if (scheduledSet.has(classKey)) {
				continue // already scheduled
			}

			await Notifications.scheduleNotificationAsync({
				content: {
					title: `⏰ Class Reminder!`,
					body: `📖 ${cls.courseTitle} (${cls.slot})\n🏫 ${cls.venue}\n🕘 ${timing.start}.\nDon’t be late! 😄`,
					sound: true,
					priority: Notifications.AndroidNotificationPriority.MAX,
					data: { classKey },
				},
				trigger: {
					type: 'date',
					date: triggerTime,
				},
				channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
			})

			scheduledSet.add(classKey)
			newCount++
		}

		await AsyncStorage.setItem('scheduledClassNotifications', JSON.stringify([...scheduledSet]))

		if (newCount > 0)
			console.log(`[Scheduler] Scheduled ${newCount} new class reminders for today.`)
		else console.log('[Scheduler] No new reminders were needed.')
	} catch (err) {
		console.error('[Scheduler] Failed to schedule reminders:', err)
	} finally {
		// Release the lock
		await AsyncStorage.setItem('schedulingLock', 'false')
	}
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
		await scheduleClassReminders(timetable)

		return BackgroundFetch.Result.NewData
	} catch (err) {
		console.error('[BG Task] Failed:', err)
		return BackgroundFetch.Result.Failed
	} finally {
		await AsyncStorage.setItem('schedulingLock', 'false')
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
