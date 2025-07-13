import { useContext, useState } from 'react'
import {
	StyleSheet,
	Text,
	View,
	Pressable,
	Alert,
	ToastAndroid,
	ActivityIndicator,
} from 'react-native'
import Constants from 'expo-constants'
import { Linking } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import { downloadAndInstallAPK, getGitHubRelease } from '../../util/getGitHubRelease'
import { useAlert } from 'custom-react-native-alert'

const version = Constants.expoConfig.version

export default function VersionInfo() {
	const { showAlert } = useAlert()
	const { colorTheme } = useContext(ColorThemeContext)
	const [progress, setProgress] = useState(null)

	const handleVersionPress = () => {
		ToastAndroid.show(`Version number: ${version}`, ToastAndroid.SHORT)
	}

	const handleGithubPress = () => {
		Linking.openURL('https://github.com/sathwikv2005/BetterVTOP-VITAP')
	}

	const handleUpdatePress = async () => {
		const github = await getGitHubRelease()

		if (!github)
			return showAlert({
				title: '✅ Boom! You’re All Caught Up',
				message: 'You’re already on the latest version. No updates are available right now.',
				styles: {
					overlay: {
						backgroundColor: '#000000B0',
					},
					container: {
						backgroundColor: colorTheme.main.secondary,
						width: '85%',
						padding: 16,
						borderRadius: 12,
						borderColor: colorTheme.main.primary,
						// elevation: 6,
						// shadowColor: colorTheme.accent.primary,
						// shadowOffset: { width: 0, height: 4 },
						// shadowOpacity: 0.3,
						// shadowRadius: 6,
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
						fontSize: 15,
						// textAlign: 'center',
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
				},
			})

		const { downloadUrl, latestVer } = github

		showAlert({
			title: '🚀 Update Available',
			message: `Version ${latestVer} is available. Would you like to update now?`,
			buttons: [
				{
					text: 'Cancel',
					onPress: () => setProgress(null),
					style: {
						backgroundColor: colorTheme.main.tertiary,
					},
					textStyle: {
						color: colorTheme.main.text,
					},
				},
				{
					text: 'Update Now',
					onPress: () => {
						setProgress(0)
						downloadAndInstallAPK(downloadUrl, latestVer, setProgress)
					},
					style: {
						backgroundColor: colorTheme.accent.primary,
					},
					textStyle: {
						color: colorTheme.main.primary,
						fontWeight: 'bold',
					},
				},
			],
			styles: {
				overlay: {
					backgroundColor: '#000000B0',
				},
				container: {
					backgroundColor: colorTheme.main.secondary,
					width: '85%',
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
					fontSize: 15,
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
			},
		})
	}

	const styles = StyleSheet.create({
		container: { padding: 0, paddingVertical: 0, width: '100%', marginTop: 20 },
		heading: {
			color: colorTheme.main.text,
			fontSize: 24,
			fontWeight: 'bold',
			marginBottom: 0,
		},
		text: { color: colorTheme.main.text },
		label: { color: colorTheme.accent.primary, fontSize: 16 },
		box: { flexDirection: 'column', width: '100%', padding: 10 },
		headingBox: { flexDirection: 'row', gap: 7, paddingHorizontal: 20, marginBottom: 5 },
		versionBox: { gap: 0, justifyContent: 'center' },
		githubBox: { flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'flex-start' },
		sub: { marginTop: 0, color: colorTheme.main.tertiary, fontWeight: 500 },
		icon: { marginTop: 6 },
		border: {
			width: '100%',
			height: 55,
			justifyContent: 'center',
			// paddingVertical: 10,
			paddingHorizontal: 20,
			marginBottom: 5,
			// borderBottomColor: colorTheme.accent.secondary,
			// borderBottomWidth: 1,
		},
		progressText: {
			color: colorTheme.main.text,
			textAlign: 'center',
			marginTop: 20,
		},
	})

	return (
		<View style={styles.container}>
			<View style={styles.headingBox}>
				<AntDesign
					name="infocirlceo"
					style={styles.icon}
					size={24}
					color={colorTheme.accent.primary}
				/>
				<Text style={styles.heading}>App info</Text>
			</View>

			<View style={styles.box}>
				<Pressable onPress={handleVersionPress} style={[styles.versionBox, styles.border]}>
					<Text style={styles.label}>Version</Text>
					<Text style={[styles.text, styles.sub, { marginLeft: 10 }]}>v{version}</Text>
				</Pressable>
				<Pressable onPress={handleUpdatePress} style={[styles.updateBox, styles.border]}>
					<Text style={styles.label}>Check for updates</Text>
				</Pressable>
				<Pressable onPress={handleGithubPress} style={[styles.border, styles.githubBox]}>
					<Feather
						name="github"
						style={[styles.icon, { marginTop: 0 }]}
						size={24}
						color={colorTheme.accent.primary}
					/>
					<Text style={[styles.text, styles.label]}>GitHub</Text>
				</Pressable>

				{progress !== null && progress < 1 && (
					<Text style={styles.progressText}>
						Downloading update: {(progress * 100).toFixed(0)}%
					</Text>
				)}
				{progress === 1 && (
					<ActivityIndicator
						style={styles.progressText}
						size="small"
						color={colorTheme.accent.primary}
					/>
				)}
			</View>
		</View>
	)
}
