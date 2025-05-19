import { Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { useContext } from 'react'
import { StyleSheet } from 'react-native'

export default function ClassItem({ item, day, ...props }) {
	const { colorTheme } = useContext(ColorThemeContext)
	const hour = new Date().getHours()
	const minutes = new Date().getMinutes()
	const weekdayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

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
			flexDirection: 'row',
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
			width: '50%',
			justifyContent: 'center',
			flexDirection: 'column',
		},
		left: {
			alignItems: 'flex-start',
		},
		right: {
			alignItems: 'flex-end',
		},
		main: {
			color: colorTheme.main.text,

			fontSize: 19,
			fontWeight: 600,
		},
		sub: {
			color: colorTheme.main.text,

			fontSize: 14,
			fontWeight: 400,
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
	})

	const startHour = parseInt(item.timings.start.split(':')[0])
	const startMinute = parseInt(item.timings.start.split(':')[1])
	const endHour = parseInt(item.timings.end.split(':')[0])
	const endMinute = parseInt(item.timings.end.split(':')[1])

	const currentTotalMinutes = hour * 60 + minutes
	const startTotalMinutes = startHour * 60 + startMinute
	const endTotalMinutes = endHour * 60 + endMinute

	let borderStyle, opacity
	if (currentTotalMinutes > endTotalMinutes) {
		borderStyle = styles.complete
		opacity = styles.completeOpacity
	} else if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
		borderStyle = styles.ongoing
		opacity = styles.ongoingOpacity
	} else {
		borderStyle = styles.upcoming
		opacity = styles.upcomingOpacity
	}

	return (
		<View style={[styles.container, opacity]}>
			<View style={[styles.box, styles.left, borderStyle]}>
				<Text style={[styles.type]}>{item.type === 'lab' ? 'Lab' : 'Theory'}</Text>
				<Text style={styles.main}>{item.courseCode}</Text>
				<Text style={styles.sub}>{item.venue}</Text>
			</View>
			<View style={[styles.box, styles.right]}>
				<Text style={styles.main}>{item.timings.start}</Text>
				<Text style={styles.sub}>{item.timings.end}</Text>
			</View>
		</View>
	)
}
