import { Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import Fontisto from '@expo/vector-icons/Fontisto'
import Entypo from '@expo/vector-icons/Entypo'
import { useContext, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { formatCourseTitle } from '../util/formatCourseTitle'

export default function MarksItem({ item, ...props }) {
	const [totalScored, setTotalScored] = useState(0)
	const [totalWeitage, setTotalWeitage] = useState(0)
	const { colorTheme } = useContext(ColorThemeContext)
	useEffect(() => {
		let total = 0
		let totalWeitage = 0
		if (!item) return
		for (const ele of item.marks) {
			const data = parseFloat(ele.weightageMark) || 0
			const dataWeitage = parseFloat(ele.weightagePercent) || 0
			total += isNaN(data) ? 0 : data
			totalWeitage += isNaN(dataWeitage) ? 0 : dataWeitage
		}
		setTotalScored(total)
		setTotalWeitage(totalWeitage)
	})

	const styles = StyleSheet.create({
		container: {
			width: '90%',
			height: 85,
			borderRadius: 10,
			overflow: 'hidden',
			alignSelf: 'center',
			marginBottom: '5%',
			flexDirection: 'column',
			justifyContent: 'space-between',
			backgroundColor: colorTheme.main.primary,
			color: colorTheme.main.text,
			elevation: 5,
			shadowColor: colorTheme.accent.primary,
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
			marginTop: 7,
			flexDirection: 'row',
			alignItems: 'center',
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

			fontSize: 15,
			fontWeight: 500,
		},
		sub: {
			color: colorTheme.main.text,
			marginTop: 2,
			fontSize: 13,
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
		icon: {
			fontSize: 17,
			marginTop: 3,
		},
		border: {
			borderLeftWidth: 10,
			borderLeftColor: colorTheme.accent.primary,
		},
		weitage: {
			// marginTop: 1,
			fontWeight: 500,
			fontSize: 15,
		},
		faculty: {
			fontWeight: 400,
			fontSize: 13,
			color: colorTheme.main.tertiary,
		},
	})

	return (
		item && (
			<View style={[styles.container]}>
				<View style={[{ height: '100%' }, styles.border]}>
					<View style={[styles.left]}>
						<View style={{ display: 'flex', flexDirection: 'row', gap: 15 }}>
							{item.courseType.toLowerCase().includes('lab') ? (
								<Fontisto name="laboratory" style={styles.icon} color={colorTheme.main.text} />
							) : (
								<Entypo name="open-book" style={styles.icon} color={colorTheme.main.text} />
							)}
							<Text style={[styles.title]}>{formatCourseTitle(item.courseTitle, 35)}</Text>
						</View>
					</View>
					<View style={[styles.box, styles.right]}>
						<Text style={[styles.faculty]}>{formatCourseTitle(item.faculty, 27)}</Text>
						<Text style={[styles.weitage, { color: colorTheme.accent.primary }]}>
							{formatScore(totalScored)}/{formatScore(totalWeitage)}
						</Text>
					</View>
				</View>
			</View>
		)
	)
}

const formatScore = (num) => {
	return Number.isInteger(num) ? num : num.toFixed(2)
}
