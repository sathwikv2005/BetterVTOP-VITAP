import { useContext } from 'react'
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import PopUp from './PopUp'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

export default function WhatsNew({ setShowWhatsNew, version }) {
	const { colorTheme } = useContext(ColorThemeContext)

	async function handleClose() {
		await AsyncStorage.setItem('last-seen-version', version)
		setShowWhatsNew(false)
	}

	const features = [
		{
			id: 1,
			icon: 'wifi',
			title: 'One-click Wi-Fi Login',
			desc: 'Login and logout from the VIT-AP Wi-Fi portal instantly with a single tap.',
		},
		{
			id: 2,
			icon: 'palette',
			title: 'Custom Theme Creator',
			desc: 'Create and apply your own color theme directly from the Settings page.',
		},
	]

	const styles = StyleSheet.create({
		container: {
			backgroundColor: colorTheme.main.secondary,
			width: '88%',
			minHeight: 280,
			padding: 25,
			borderRadius: 15,
			flexDirection: 'column',
			justifyContent: 'space-between',
		},
		header: {
			width: '100%',
			marginBottom: 10,
		},
		heading: {
			color: '#E0F1FF',
			fontSize: 20,
			fontWeight: '600',
		},
		featureCard: {
			flexDirection: 'row',
			alignItems: 'flex-start',
			backgroundColor: colorTheme.main.primary,
			padding: 15,
			paddingVertical: 25,
			borderRadius: 10,
			marginVertical: 6,
			gap: 10,
		},
		featureTextContainer: {
			flex: 1,
		},
		featureTitle: {
			color: colorTheme.accent.primary,
			fontSize: 16,
			fontWeight: '600',
			marginBottom: 2,
		},
		featureDesc: {
			color: colorTheme.main.text,
			fontSize: 13,
		},
		btnWrapper: {
			alignSelf: 'flex-end',
			marginTop: 18,
		},
		btn: {
			paddingHorizontal: 20,
			paddingVertical: 8,
			backgroundColor: colorTheme.accent.secondary,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 5,
		},
		btntext: {
			color: colorTheme.main.primary,
			fontWeight: '800',
			fontSize: 16,
		},
	})

	return (
		<PopUp>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.heading}>✨ What's New In v{version}</Text>
				</View>

				<FlatList
					data={features}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<View style={styles.featureCard}>
							<MaterialCommunityIcons
								name={item.icon}
								size={28}
								color={colorTheme.accent.primary}
							/>
							<View style={styles.featureTextContainer}>
								<Text style={styles.featureTitle}>{item.title}</Text>
								<Text style={styles.featureDesc}>{item.desc}</Text>
							</View>
						</View>
					)}
				/>

				<View style={styles.btnWrapper}>
					<Pressable style={styles.btn} onPress={handleClose}>
						<Text style={styles.btntext}>OK</Text>
					</Pressable>
				</View>
			</View>
		</PopUp>
	)
}
