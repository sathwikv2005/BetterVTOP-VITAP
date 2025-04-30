import { Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { useContext } from 'react'
import { StyleSheet } from 'react-native'

export default function ClassItem({ item, ...props }) {
	const { colorTheme } = useContext(ColorThemeContext)

	const styles = StyleSheet.create({
		container: {
			width: '90%',
			height: 85,
			borderRadius: 10,
			overflow: 'hidden',
			alignSelf: 'center',
			marginBottom: '3%',
			flexDirection: 'row',
			backgroundColor: colorTheme.accent.tertiary,
			opacity: 0.8,
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
			opacity: 3,
			fontSize: 19,
			fontWeight: 600,
		},
		sub: {
			color: colorTheme.main.primary,
			opacity: 1,
			fontSize: 16,
			fontWeight: 600,
		},
		type: {
			fontWeight: 500,
			fontSize: 16,
		},
		lab: {
			borderLeftWidth: 10,
			borderLeftColor: colorTheme.main.text,
		},
		theory: {
			borderLeftWidth: 10,
			borderLeftColor: colorTheme.accent.secondary,
		},
	})

	return (
		<View style={styles.container}>
			<View style={[styles.box, styles.left, item.type === 'lab' ? styles.lab : styles.theory]}>
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
