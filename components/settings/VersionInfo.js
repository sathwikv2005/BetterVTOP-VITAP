import { useContext, useState } from 'react'
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	Linking,
	ActivityIndicator,
	ToastAndroid,
	Platform,
} from 'react-native'
import Constants from 'expo-constants'
import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import { useAlert } from 'custom-react-native-alert'
import { downloadAndInstallAPK, getGitHubRelease } from '../../util/getGitHubRelease'

const version = Constants.expoConfig.version

export default function VersionInfo() {
	const { colorTheme } = useContext(ColorThemeContext)
	const { showAlert } = useAlert()
	const [progress, setProgress] = useState(null)

	const handleVersionPress = () => {
		ToastAndroid.show(`📱 App version: v${version}`, ToastAndroid.SHORT)
	}

	const handleGithubPress = () => {
		Linking.openURL('https://github.com/sathwikv2005/BetterVTOP-VITAP')
	}

	const handleUpdatePress = async () => {
		const github = await getGitHubRelease()

		if (!github) {
			return showAlert({
				title: '✅ Up to date!',
				message: 'You’re already on the latest version.',
				styles: getAlertStyles(),
			})
		}

		const { downloadUrl, latestVer, body } = github

		showAlert({
			title: '🚀 New Version Available',
			message: `Version ${latestVer} is ready. Want to update now?\n\n${body}`,
			buttons: [
				{
					text: 'Cancel',
					onPress: () => setProgress(null),
					style: { backgroundColor: colorTheme.main.tertiary },
					textStyle: { color: colorTheme.main.text },
				},
				{
					text: 'Update Now',
					onPress: () => {
						setProgress(0)
						downloadAndInstallAPK(downloadUrl, latestVer, setProgress)
					},
					style: { backgroundColor: colorTheme.accent.primary },
					textStyle: {
						color: colorTheme.main.primary,
						fontWeight: 'bold',
					},
				},
			],
			styles: getAlertStyles(),
		})
	}

	const getAlertStyles = () => ({
		overlay: { backgroundColor: '#000000B0' },
		container: {
			backgroundColor: colorTheme.main.secondary,
			width: '95%',
			padding: 16,
			borderRadius: 12,
			borderColor: colorTheme.main.primary,
		},
		title: {
			color: colorTheme.accent.primary,
			fontSize: 18,
			fontWeight: '600',
			marginBottom: 4,
			textAlign: 'center',
		},
		message: {
			marginTop: 10,
			color: colorTheme.main.text,
			fontSize: 14,
			marginBottom: 12,
		},
		okButton: {
			backgroundColor: colorTheme.accent.primary,
			paddingVertical: 10,
			borderRadius: 8,
		},
		okText: {
			color: colorTheme.main.primary,
			fontWeight: 'bold',
			textAlign: 'center',
		},
	})

	const RowItem = ({ icon, label, onPress, trailing }) => (
		<View style={{ borderRadius: 10, overflow: 'hidden' }}>
			<Pressable
				onPress={onPress}
				android_ripple={{
					color: colorTheme.main.tertiary,
					borderless: false,
					radius: 200,
				}}
				style={({ pressed }) => [
					styles.row,
					pressed && Platform.OS === 'ios' && { opacity: 0.6 },
					{ borderRadius: 5 },
				]}
			>
				<View style={styles.rowLeft}>
					{icon}
					<Text style={[styles.label, { color: colorTheme.main.text }]}>{label}</Text>
				</View>
				{trailing && (
					<Text style={[styles.trailing, { color: colorTheme.main.tertiary }]}>{trailing}</Text>
				)}
			</Pressable>
		</View>
	)

	const styles = StyleSheet.create({
		container: {
			width: '100%',
			paddingHorizontal: 20,
			paddingTop: 30,
			zIndex: -1,
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
			padding: 10,
			gap: 10,
			borderColor: colorTheme.main.tertiary,
			borderWidth: 1,
			elevation: 5,
			shadowColor: colorTheme.accent.primary,
		},
		row: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingVertical: 12,
			paddingHorizontal: 8,
		},
		rowLeft: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 10,
		},
		label: {
			fontSize: 16,
		},
		trailing: {
			fontSize: 14,
		},
		progress: {
			textAlign: 'center',
			fontSize: 14,
			marginTop: 5,
			color: colorTheme.main.text,
		},
	})

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>App Info</Text>

			<View style={styles.card}>
				<RowItem
					icon={<AntDesign name="infocirlceo" size={20} color={colorTheme.accent.primary} />}
					label="Version"
					onPress={handleVersionPress}
					trailing={`v${version}`}
				/>
				<RowItem
					icon={<Feather name="download" size={20} color={colorTheme.accent.primary} />}
					label="Check for Updates"
					onPress={handleUpdatePress}
				/>
				<RowItem
					icon={<Feather name="github" size={20} color={colorTheme.accent.primary} />}
					label="GitHub"
					onPress={handleGithubPress}
				/>

				{progress !== null && progress < 1 && (
					<Text style={styles.progress}>{`⬇️ Downloading: ${(progress * 100).toFixed(0)}%`}</Text>
				)}

				{progress === 1 && (
					<ActivityIndicator
						size="small"
						color={colorTheme.accent.primary}
						style={{ marginTop: 10 }}
					/>
				)}
			</View>
		</View>
	)
}
