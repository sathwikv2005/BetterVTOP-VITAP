import Constants from 'expo-constants'
import * as IntentLauncher from 'expo-intent-launcher'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import * as mime from 'react-native-mime-types'
import { requestStoragePermission } from './requestStoragePermission'
import { Alert } from 'react-native'

const version = Constants.expoConfig.version
const buildNumber = Constants.expoConfig.android?.versionCode

export async function getGitHubRelease() {
	const res = await fetch('https://api.github.com/repos/sathwikv2005/BetterVTOP-VITAP/releases')
	const data = await res.json()
	const latest = data[0]

	const latestVer = latest.tag_name

	if ('v' + version === latestVer) return false

	const assetsReq = await fetch(latest.assets_url)
	const assets = (await assetsReq.json())[0]

	const downloadUrl = assets.browser_download_url
	return {
		latestVer,
		downloadUrl,
	}
}

export async function downloadAndInstallAPK(downloadUrl, latestVer, setProgress) {
	const { status } = await MediaLibrary.requestPermissionsAsync()
	if (status !== 'granted') {
		setProgress(null)
		return Alert.alert('Permission Required', 'Please allow storage access.')
	}

	if (!downloadUrl || !latestVer) {
		const latest = await getGitHubRelease()
		if (!latest) {
			setProgress(null)
			return Alert.alert('No updates available.')
		}
		downloadUrl = latest.downloadUrl
		latestVer = latest.latestVer
	}

	const filePath = `${FileSystem.documentDirectory}BetterVTOP-${latestVer}.apk`

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
		setProgress(null)
	} catch (err) {
		console.error('Install error:', err)
		Alert.alert('Error', 'Failed to install update.')
	}
}
