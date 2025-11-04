import { useContext } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import PopUp from './PopUp'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

const { height } = Dimensions.get('window')

export default function WhatsNew({ setShowWhatsNew, version }) {
	const { colorTheme } = useContext(ColorThemeContext)

	async function handleClose() {
		await AsyncStorage.setItem('last-seen-version', version)
		setShowWhatsNew(false)
	}

	const features = [
		{
			id: 1,
			icon: 'speedometer',
			title: 'New Feature: Speed Test',
			desc: 'Check your internet speed directly within the app with our new built-in speed test.',
			type: 'feature',
		},
		{
			id: 2,
			icon: 'check-circle',
			title: 'Bug Fix: Class Reminders',
			desc: 'Ensures consistent scheduling of class reminders so you never miss a lecture.',
			type: 'bug',
		},
		{
			id: 3,
			icon: 'alert-circle',
			title: 'Bug Fix: Action Buttons',
			desc: 'Resolved rare issue where action buttons in attendance log failed to trigger on tap.',
			type: 'bug',
		},
	]

	const styles = StyleSheet.create({
		container: {
			backgroundColor: colorTheme.main.secondary,
			width: '88%',
			minHeight: 280,
			maxHeight: height * 0.55,
			padding: 25,
			borderRadius: 15,
			flexDirection: 'column',
			justifyContent: 'space-between',
		},
		header: {
			width: '100%',
			marginBottom: 15,
		},
		heading: {
			color: '#E0F1FF',
			fontSize: 20,
			fontWeight: '600',
		},
		sectionTitle: {
			color: colorTheme.accent.primary,
			fontSize: 16,
			fontWeight: '700',
			marginVertical: 10,
		},
		featureCard: {
			flexDirection: 'row',
			alignItems: 'flex-start',
			backgroundColor: colorTheme.main.primary,
			padding: 15,
			paddingVertical: 20,
			borderRadius: 10,
			marginVertical: 6,
			gap: 10,
		},
		featureTextContainer: {
			flex: 1,
		},
		featureTitle: {
			color: colorTheme.accent.primary,
			fontSize: 15,
			fontWeight: '600',
			marginBottom: 3,
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

	const renderFeature = (item) => (
		<View key={item.id} style={styles.featureCard}>
			<MaterialCommunityIcons name={item.icon} size={28} color={colorTheme.accent.primary} />
			<View style={styles.featureTextContainer}>
				<Text style={styles.featureTitle}>{item.title}</Text>
				<Text style={styles.featureDesc}>{item.desc}</Text>
			</View>
		</View>
	)

	const newFeatures = features.filter((f) => f.type === 'feature')
	const bugFixes = features.filter((f) => f.type === 'bug')

	return (
		<PopUp>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.heading}>✨ What's New In v{version}</Text>
				</View>

				{/* Scrollable content */}
				<ScrollView showsVerticalScrollIndicator={true}>
					{newFeatures.length > 0 && (
						<>
							<Text style={styles.sectionTitle}>🆕 New Features</Text>
							{newFeatures.map(renderFeature)}
						</>
					)}

					{bugFixes.length > 0 && (
						<>
							<Text style={styles.sectionTitle}>🐞 Bug Fixes</Text>
							{bugFixes.map(renderFeature)}
						</>
					)}
				</ScrollView>

				<View style={styles.btnWrapper}>
					<Pressable style={styles.btn} onPress={handleClose}>
						<Text style={styles.btntext}>OK</Text>
					</Pressable>
				</View>
			</View>
		</PopUp>
	)
}
