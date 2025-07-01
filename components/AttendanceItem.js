import { Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import Fontisto from '@expo/vector-icons/Fontisto'
import Entypo from '@expo/vector-icons/Entypo'
import { useContext } from 'react'
import { StyleSheet } from 'react-native'

export default function AttendanceItem({ data, minPercent, ...props }) {
	const { colorTheme } = useContext(ColorThemeContext)
	const attendanceGreen = parseInt(data.percentage) >= parseInt(minPercent)

	const style = StyleSheet.create({
		container: {
			width: '95%',
			height: 105,
			borderRadius: 10,
			overflow: 'hidden',
			alignSelf: 'center',
			marginBottom: '5%',
			display: 'flex',
			justifyContent: 'space-evenly',
			flexDirection: 'column',
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
			width: '100%',
			justifyContent: 'center',
			flexDirection: 'row',
		},
		mainText: {
			color: colorTheme.main.text,
		},
		header: {
			marginTop: 5,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		course: {
			gap: 5,
			flexDirection: 'row',
			alignItems: 'center',
		},
		headerText: {
			fontSize: 14,
			fontWeight: 600,
		},
		percentage: {
			fontSize: 17,
			fontWeight: 600,
			marginRight: 5,
		},
		green: {
			color: '#01BD39FF',
		},
		red: {
			color: '#DA2C00FF',
		},
		greenBorder: {
			height: '100%',
			borderRadius: 10,
			borderLeftWidth: 10,
			borderLeftColor: '#01BD39FF',
			// borderBottomWidth: 5,
			// borderBottomColor: '#01BD39FF',
		},
		redBorder: {
			height: '100%',
			borderRadius: 10,
			borderLeftWidth: 10,
			borderLeftColor: '#DA2C00FF',
			// borderBottomWidth: 5,
			// borderBottomColor: '#DA2C00FF',
		},
		details: {
			flexDirection: 'row',
			justifyContent: 'space-around',
			marginTop: -5,
		},
		detailsBox: {
			width: '50%',
		},
		icon: {
			fontSize: 18,
			marginTop: 0,
		},
	})

	return (
		<View style={style.container}>
			<View style={attendanceGreen ? style.greenBorder : style.redBorder}>
				<View style={[style.box, style.header]}>
					<View style={style.course}>
						{data.classType.includes('T') ? (
							<Entypo name="open-book" style={style.icon} size={18} color={colorTheme.main.text} />
						) : (
							<Fontisto
								name="laboratory"
								style={style.icon}
								size={18}
								color={colorTheme.main.text}
							/>
						)}
						<Text style={[style.mainText, style.headerText]}>
							{formatCourseTitle(data.courseDetails)}
						</Text>
					</View>
					<Text style={[style.percentage, attendanceGreen ? style.green : style.red]}>
						{data.percentage}%
					</Text>
				</View>

				<View style={[style.box, style.details]}>
					<View style={[style.attended, style.detailsBox]}>
						<Text style={[style.mainText]}>Attended</Text>
						<Text style={[style.mainText]}>
							{data.attended}/{data.totalClasses}
						</Text>
					</View>
					<View style={[style.buffer, style.detailsBox]}>
						<Text
							style={[
								style.mainText,
								{ textAlign: 'center' },
								attendanceGreen ? style.green : style.red,
							]}
						>
							{attendanceGreen ? 'Can skip' : 'Need to Attend'}
						</Text>
						<Text
							style={[
								style.mainText,
								{ textAlign: 'center' },
								attendanceGreen ? style.green : style.red,
							]}
						>
							{calcBufferClasses(minPercent, data.attended, data.totalClasses)}
						</Text>
					</View>
				</View>
			</View>
		</View>
	)
}

function calcBufferClasses(minPercent, attended, totalClasses) {
	const p = parseInt(minPercent)
	const a = parseInt(attended)
	const t = parseInt(totalClasses)
	const percentage = (a * 100) / t
	if (percentage < p) return classesNeeded(a, t, p)
	return classesCanSkip(a, t, p)
}

function classesNeeded(a, t, p) {
	if (p <= (a / t) * 100) return 0 // already at or above target

	const x = (p * t - 100 * a) / (100 - p)
	return Math.ceil(x) // round up since you can't attend a fraction of a class
}

function classesCanSkip(a, t, p) {
	const x = (a * 100) / p - t
	return Math.floor(x >= 0 ? x : 0)
}

function formatCourseTitle(title, maxLength = 30) {
	const parts = title.split(' - ')
	const trimmed = parts.slice(0, 2).join(' ')

	if (trimmed.length <= maxLength) return trimmed

	return trimmed.slice(0, maxLength - 3).trimEnd() + '...'
}
