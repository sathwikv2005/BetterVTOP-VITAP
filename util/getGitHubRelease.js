import Constants from 'expo-constants'
import * as IntentLauncher from 'expo-intent-launcher'
import * as FileSystem from 'expo-file-system'
import * as mime from 'react-native-mime-types'
import { ToastAndroid } from 'react-native'
import { Alert } from 'react-native'

const version = Constants.expoConfig.version
const buildNumber = Constants.expoConfig.android?.versionCode

export async function getGitHubRelease() {
	const res = await fetch('https://api.github.com/repos/sathwikv2005/BetterVTOP-VITAP/releases')
	const data = await res.json()
	const latest = data[0]

	const latestVer = latest.tag_name

	// if ('v' + version === latestVer) return false

	const downloadUrl = latest.assets[0].browser_download_url
	const body = cleanMarkdown(latest.body)
	console.log(latest.assets)
	return {
		latestVer,
		downloadUrl,
		body,
	}
}

export async function downloadAndInstallAPK(downloadUrl, latestVer, setProgress) {
	// const { status } = await MediaLibrary.requestPermissionsAsync()
	// if (status !== 'granted') {
	// 	setProgress(null)
	// 	return Alert.alert('Permission Required', 'Please allow storage access.')
	// }
	console.log(downloadUrl)
	if (!downloadUrl || !latestVer) {
		const latest = await getGitHubRelease()
		if (!latest) {
			setProgress(null)
			return Alert.alert('No updates available.')
		}
		downloadUrl = latest.downloadUrl
		latestVer = latest.latestVer
	}

	const filePath = `${FileSystem.documentDirectory}BetterVTOP.apk`

	try {
		const downloadResumable = FileSystem.createDownloadResumable(
			downloadUrl,
			filePath,
			{},
			(downloadProgress) => {
				const progress =
					downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
				setProgress(progress)
			}
		)

		const res = await downloadResumable.downloadAsync()
		if (!res.uri) {
			setProgress(null)
			return Alert.alert('Download Failed', 'Try again later.')
		}

		const contentUri = await FileSystem.getContentUriAsync(res.uri)
		await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
			data: contentUri,
			flags: 1,
			type: mime.lookup(res.uri) || 'application/vnd.android.package-archive',
		})
		setTimeout(async () => {
			try {
				await FileSystem.deleteAsync(res.uri, { idempotent: true })
				ToastAndroid.show('Update file cleaned up successfully.', ToastAndroid.SHORT)
			} catch (err) {
				console.warn('Failed to delete APK:', err)
			}
		}, 5000)
		setProgress(null)
	} catch (err) {
		console.error('Install error:', err)
		Alert.alert('Error', 'Failed to install update.')
	}
}

function cleanMarkdown(body) {
	return (
		body
			// Remove leading ###, ##, # headers
			.replace(/^#+\s*/gm, '')
			// Remove markdown bold and italic (**text**, *text*, _text_)
			.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
			// Convert list markers to bullet points
			.replace(/^[-*+]\s+/gm, '➜ ')
			// Remove backticks for inline code
			.replace(/`([^`]+)`/g, '$1')
			// Do not collapse multiple newlines
			.trim()
	)
}
