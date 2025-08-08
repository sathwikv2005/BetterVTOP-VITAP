import { useContext, useEffect, useState } from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Haptics from 'expo-haptics'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent, setUserProperty } from '@react-native-firebase/analytics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import ColorTheme from './ColorTheme'

const app = getApp()
const analytics = getAnalytics(app)

export default function General({ openSheet }) {
	const { colorTheme } = useContext(ColorThemeContext)
	const [upcomingClassNoti, setUpcomingClassNoti] = useState(true)

	useEffect(() => {
		AsyncStorage.getItem('upcomingClassNotiEnabled').then((value) => {
			if (value !== null) setUpcomingClassNoti(JSON.parse(value))
		})
	}, [])

	async function handleUpComingClassNotiChange() {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		const newState = !upcomingClassNoti

		if (!newState) {
			await Notifications.cancelAllScheduledNotificationsAsync()
			await AsyncStorage.removeItem('scheduledClassNotifications')

			// Log disabling notifications
			await logEvent(analytics, 'notification_toggle', {
				enabled: false,
				screen: 'GeneralSettings',
			})
		} else {
			// Log enabling notifications
			await logEvent(analytics, 'notification_toggle', {
				enabled: true,
				screen: 'GeneralSettings',
			})
		}

		setUpcomingClassNoti(newState)
		await AsyncStorage.setItem('upcomingClassNotiEnabled', JSON.stringify(newState))
	}

	const styles = StyleSheet.create({
		container: {
			width: '100%',
			paddingHorizontal: 20,
			paddingTop: 15,
		},
		heading: {
			fontSize: 24,
			fontWeight: 'bold',
			marginBottom: 12,
			color: colorTheme.main.text,
		},
		card: {
			backgroundColor: colorTheme.main.secondary,
			borderRadius: 12,
			elevation: 8,
			shadowColor: colorTheme.accent.primary,
			padding: 12,
			borderColor: colorTheme.main.tertiary,
			borderWidth: 1,
			gap: 12,
		},
		row: {
			width: '100%',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingVertical: 8,
			paddingHorizontal: 4,
		},
		label: {
			color: colorTheme.main.text,
			fontSize: 15,
		},
	})

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>General</Text>
			<View style={styles.card}>
				<ColorTheme openSheet={openSheet} />
				<View style={styles.row}>
					<Text style={styles.label}>Class Reminders {upcomingClassNoti ? '🔔' : '🔕'}</Text>
					<Switch
						trackColor={{
							false: colorTheme.main.tertiary,
							true: colorTheme.accent.tertiary,
						}}
						thumbColor={upcomingClassNoti ? colorTheme.accent.primary : colorTheme.main.tertiary}
						onValueChange={handleUpComingClassNotiChange}
						value={upcomingClassNoti}
					/>
				</View>
			</View>
		</View>
	)
}
