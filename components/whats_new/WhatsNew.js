import { useContext } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import PopUp from './PopUp'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function WhatsNew({ setShowWhatsNew, version }) {
	const { colorTheme } = useContext(ColorThemeContext)

	async function handleClose() {
		await AsyncStorage.setItem('last-seen-version', version)
		setShowWhatsNew(false)
	}

	const styles = StyleSheet.create({
		container: {
			backgroundColor: '#0A0F1F',
			width: '88%',
			minHeight: 250,
			padding: 25,
			borderRadius: 15,
			flexDirection: 'column',
			justifyContent: 'space-between',
		},
		header: {
			width: '100%',
		},
		heading: {
			color: '#E0F1FF',
			fontSize: 20,
			fontWeight: '600',
		},
		btnWrapper: {
			alignSelf: 'flex-end',
			marginTop: 20,
		},
		btn: {
			paddingHorizontal: 20,
			paddingVertical: 10,
			backgroundColor: '#0A8DE8',
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 5,
		},
		btntext: {
			color: '#fff',
			fontWeight: 'bold',
		},
	})

	return (
		<PopUp>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.heading}>✨ What's New</Text>
				</View>

				<View style={styles.btnWrapper}>
					<Pressable style={styles.btn} onPress={handleClose}>
						<Text style={styles.btntext}>OK</Text>
					</Pressable>
				</View>
			</View>
		</PopUp>
	)
}
