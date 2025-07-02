import { Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import Fontisto from '@expo/vector-icons/Fontisto'
import Entypo from '@expo/vector-icons/Entypo'
import { useContext } from 'react'
import { StyleSheet } from 'react-native'
import { formatCourseTitle } from '../util/formatCourseTitle'

export default function ClassItem({ item, day, ...props }) {
	const { colorTheme } = useContext(ColorThemeContext)
	const hour = new Date().getHours()
	const minutes = new Date().getMinutes()
	const weekdayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
	console.log(item)
	var todayIndex = new Date().getDay()

	const routeName = weekdayMap[todayIndex]

	const styles = StyleSheet.create({
		container: {
			width: '90%',
			height: 85,
			borderRadius: 10,
			overflow: 'hidden',
			alignSelf: 'center',
			marginBottom: '3%',
			flexDirection: 'column',
			justifyContent: 'space-between',
			backgroundColor: colorTheme.main.primary,
			color: colorTheme.main.text,
			elevation: 3,
			shadowColor: colorTheme.accent.secondary,
			shadowOffset: { width: -2, height: -4 },
			shadowOpacity: 0.3,
			shadowRadius: 5,
		},
		box: {
			padding: 8,
			paddingHorizontal: 20,
			// width: '50%',
			justifyContent: 'center',
			flexDirection: 'column',
		},
		left: {
			marginTop: 10,
			marginLeft: 10,
		},
		right: {
			marginTop: 5,
			flexDirection: 'row',
			justifyContent: 'space-between',
		},
		title: {
			color: colorTheme.main.text,
			marginLeft: -7,
			fontSize: 16,
			fontWeight: 600,
		},
		main: {
			color: colorTheme.main.text,

			fontSize: 16,
			fontWeight: 600,
		},
		sub: {
			color: colorTheme.main.text,
			marginTop: 2,
			fontSize: 14,
			fontWeight: 400,
		},
		highlights: {
			color: colorTheme.accent.primary,
		},
		type: {
			fontWeight: 400,
			color: colorTheme.main.text,
			fontSize: 14,
		},
		complete: {
			borderLeftWidth: 10,

			borderLeftColor: colorTheme.main.tertiary,
		},
		ongoing: {
			borderLeftWidth: 10,
			borderLeftColor: colorTheme.accent.primary,
			opacity: 1,
		},
		upcoming: {
			borderLeftWidth: 10,
			borderLeftColor: colorTheme.main.text,
			opacity: 1,
		},
		completeOpacity: {
			opacity: 0.7,
		},
		ongoingOpacity: {
			opacity: 1,
		},
		upcomingOpacity: {
			opacity: 0.8,
		},
		icon: {
			fontSize: 17,
			marginTop: 4,
		},
		timings: {
			flexDirection: 'row',
			textAlign: 'center',
			justifyContent: 'center',
			alignContent: 'center',
			gap: 5,
		},
	})

	const startHour = parseInt(item.timings.start.split(':')[0])
	const startMinute = parseInt(item.timings.start.split(':')[1])
	const endHour = parseInt(item.timings.end.split(':')[0])
	const endMinute = parseInt(item.timings.end.split(':')[1])

	const currentTotalMinutes = hour * 60 + minutes
	const startTotalMinutes = startHour * 60 + startMinute - 5
	const endTotalMinutes = endHour * 60 + endMinute
	let isOngoing = false
	let borderStyle, opacity
	if (routeName !== day) {
		borderStyle = styles.complete
		opacity = styles.completeOpacity
	} else if (currentTotalMinutes > endTotalMinutes) {
		borderStyle = styles.complete
		opacity = styles.completeOpacity
	} else if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
		borderStyle = styles.ongoing
		opacity = styles.ongoingOpacity
		isOngoing = true
	} else {
		borderStyle = styles.upcoming
		opacity = styles.upcomingOpacity
	}

	return (
		<View style={[styles.container, opacity]}>
			<View style={[{ height: '100%' }, borderStyle]}>
				<View style={[styles.left]}>
					<View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
						{item.type === 'lab' ? (
							<Fontisto
								name="laboratory"
								style={styles.icon}
								color={isOngoing ? colorTheme.accent.primary : colorTheme.main.text}
							/>
						) : (
							<Entypo
								name="open-book"
								style={styles.icon}
								color={isOngoing ? colorTheme.accent.primary : colorTheme.main.text}
							/>
						)}
						<Text style={[styles.title, isOngoing ? styles.highlights : '']}>
							{formatCourseTitle(item.courseTitle, 35)}
						</Text>
					</View>
				</View>
				<View style={[styles.box, styles.right]}>
					<Text style={styles.main}>{item.venue}</Text>
					<View style={[styles.timings]}>
						<Text style={styles.main}>{item.timings.start}</Text>
						<Text style={styles.main}>-</Text>
						<Text style={styles.sub}>{item.timings.end}</Text>
					</View>
				</View>
			</View>
		</View>
	)
}
