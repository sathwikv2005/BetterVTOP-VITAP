// PopUp.js
import { useContext } from 'react'
import { StyleSheet, View, Dimensions, Modal } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'

export default function PopUp({ customStyle, children }) {
	const { colorTheme } = useContext(ColorThemeContext)

	const styles = StyleSheet.create({
		overlay: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: `${colorTheme.main.primary}88`,
		},
	})

	return (
		<Modal transparent animationType="slide">
			<View style={[styles.overlay, customStyle]}>{children}</View>
		</Modal>
	)
}
