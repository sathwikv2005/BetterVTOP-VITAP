import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useContext, useState, useEffect } from 'react'
import { WebView } from 'react-native-webview'
import { ColorThemeContext } from '../context/ColorThemeContext'
import CookieManager from '@react-native-cookies/cookies'
import { forceVtopLogin, vtopLogin } from '../util/VTOP/login'
import VtopConfig from '../vtop_config.json'
import Headers from '../headers.json'
import RNFS from 'react-native-fs'
import { Platform, PermissionsAndroid } from 'react-native'
import FileViewer from 'react-native-file-viewer'
import * as IntentLauncher from 'expo-intent-launcher'
import * as FileSystem from 'expo-file-system'
import * as Mime from 'react-native-mime-types'
import { useAlert } from 'custom-react-native-alert'
import mimeToExtension from '../util/mimeToExtension'

export default function OpenVTOP({ navigation }) {
	const { showAlert } = useAlert()
	const [showWebView, setShowWebView] = useState(false)
	const [loading, setLoading] = useState(false)
	const [sessionID, setSessionID] = useState(null)
	const [CSRF, setCSRF] = useState(null)
	const [webLoading, setWebLoading] = useState(false)

	const { colorTheme } = useContext(ColorThemeContext)

	async function closeWebview() {
		setShowWebView(false)
		setSessionID(null)
		setCSRF(null)
		await CookieManager.clearAll()
		navigation.setOptions({ headerRight: undefined }) // remove after closing
	}

	useEffect(() => {
		if (showWebView) {
			navigation.setOptions({
				headerRight: () => (
					<Pressable onPress={closeWebview} style={{ marginRight: 16 }}>
						<Text style={{ color: colorTheme.accent.secondary, fontWeight: 'bold' }}>Close</Text>
					</Pressable>
				),
			})
		} else {
			navigation.setOptions({ headerRight: undefined })
		}
	}, [showWebView])

	async function openVTOPWebView() {
		setLoading(true)
		const loginData = await vtopLogin()

		if (loginData.error) {
			setLoading(false)
			return Alert.alert(
				'Login setup failed',
				`Failed to login! Please try again later. \n error: ${loginData.error}`
			)
		}
		const { jsessionId, csrf } = loginData
		setSessionID(jsessionId)
		setCSRF(csrf)
		await CookieManager.set(VtopConfig.domain, {
			name: 'JSESSIONID',
			value: jsessionId,
		})
		setLoading(false)
		setShowWebView(true)
	}

	if (showWebView && sessionID) {
		return (
			<View style={{ flex: 1 }}>
				{/* Loading overlay */}
				{webLoading && (
					<View
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: 'rgba(0,0,0,0.2)',
							zIndex: 10,
						}}
					>
						<ActivityIndicator size="large" color={colorTheme.accent.primary} />
						<Text style={{ marginTop: 10, color: colorTheme.main.text }}>Loading VTOP...</Text>
					</View>
				)}

				<WebView
					cacheEnabled={false}
					source={{
						uri: VtopConfig.domain + VtopConfig.vtopUrls.homepage + `?_csrf=${CSRF}`,
						headers: {
							Cookie: `JSESSIONID=${sessionID}`,
						},
					}}
					onShouldStartLoadWithRequest={(req) => {
						const url = req.url

						if (
							url.includes('downloadPdf') ||
							url.includes('courseSyllabusDownload') ||
							url.includes('allCourseMeterialDownload')
						) {
							const fullUrl = url.startsWith('/vtop/')
								? VtopConfig.domain + url
								: VtopConfig.domain +
								  '/vtop/' +
								  url.replace(
										/^.*?(downloadPdf|courseSyllabusDownload|allCourseMeterialDownload)/,
										'$1'
								  )
							handleFileDownload(fullUrl, sessionID, showAlert, colorTheme, setWebLoading)
							return false
						}
						return true
					}}
					injectedJavaScript={`
						(function() {
						  const originalOpen = window.open;
						  window.open = function(url) {
							if (
							  url.toLowerCase().includes('download') ||
							  url.includes('courseSyllabusDownload') ||
							  url.includes('allCourseMeterialDownload')
							) {
							  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'download', url }));
							  return null;
							}
							return originalOpen(url);
						  };
						})();
						true;
					  `}
					onMessage={async (event) => {
						try {
							const data = JSON.parse(event.nativeEvent.data)

							if (data.type === 'download' && data.url) {
								const fullUrl = data.url.startsWith('/vtop/')
									? VtopConfig.domain + data.url
									: VtopConfig.domain + '/vtop/' + data.url

								await handleFileDownload(fullUrl, sessionID, showAlert, colorTheme, setWebLoading)
							}
						} catch (err) {
							console.warn('Invalid message from WebView:', err)
						}
					}}
					onLoadStart={() => setWebLoading(true)}
					onLoadEnd={() => setWebLoading(false)}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					sharedCookiesEnabled={true}
					thirdPartyCookiesEnabled={true}
					// incognito={true}
				/>
			</View>
		)
	}

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color={colorTheme.accent.primary} />
				<Text style={{ marginTop: 10, color: colorTheme.main.text }}>Logging into VTOP...</Text>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text
				style={{
					marginBottom: 16,
					paddingHorizontal: 20,
					textAlign: 'center',
					color: colorTheme.main.text,
				}}
			>
				You’re about to open the official VTOP website inside the app. (No login required.)
			</Text>

			<Pressable
				onPress={openVTOPWebView}
				style={{
					padding: 12,
					borderRadius: 8,
					backgroundColor: colorTheme.accent.primary,
					alignItems: 'center',
				}}
			>
				<Text style={{ color: colorTheme.main.primary, fontWeight: 'bold' }}>Open VTOP</Text>
			</Pressable>
		</View>
	)
}

async function requestStoragePermission() {
	if (Platform.OS !== 'android') return true

	const sdk = Platform.Version

	if (sdk >= 33) {
		// Android 13+ - request media-specific access
		const granted = await PermissionsAndroid.requestMultiple([
			PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
			PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
			PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
		])
		return (
			granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED ||
			granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED ||
			granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
		)
	} else if (sdk >= 30) {
		// Android 11–12 — you *cannot* use WRITE_EXTERNAL_STORAGE
		// Only internal app directories are safe (or use MediaStore via native modules)
		return true
	} else {
		// Android 10 and below — request legacy storage permission
		const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
		)
		return granted === PermissionsAndroid.RESULTS.GRANTED
	}
}

export async function handleFileDownload(url, sessionID, showAlert, colorTheme, setWebLoading) {
	try {
		// const granted = await requestStoragePermission()
		// if (!granted) throw new Error('Storage permission not granted')
		const tempPath = `${RNFS.CachesDirectoryPath}/tempDownload`

		setWebLoading(true)
		const res = await RNFS.downloadFile({
			fromUrl: url,
			toFile: tempPath,
			headers: {
				Cookie: `JSESSIONID=${sessionID}`,
			},
		}).promise

		if (res.statusCode !== 200) {
			throw new Error('Download failed')
		}

		const headRes = await fetch(url, {
			method: 'HEAD',
			headers: {
				Cookie: `JSESSIONID=${sessionID}`,
			},
		})

		const contentType = headRes.headers.get('content-type') || headRes.headers.get('Content-Type')

		const extension = mimeToExtension[contentType] || 'bin'
		const fileName = `VTOP_${Date.now()}.${extension}`
		const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`

		await RNFS.moveFile(tempPath, downloadPath)
		setWebLoading(false)
		showAlert({
			title: '✅ Downloaded',
			message: `Saved to Downloads as ${fileName}`,
			buttons: [
				{
					text: 'Cancel',
					style: {
						backgroundColor: colorTheme.main.tertiary,
					},
					textStyle: {
						color: colorTheme.main.text,
					},
				},
				{
					text: 'Open',
					onPress: () => {
						openFile(downloadPath, showAlert, colorTheme).catch((err) => {
							console.error('Error opening file:', err)
							showAlert({
								title: '⚠️ Error',
								message: 'No app found to open this file.',
								buttons: [
									{
										text: 'OK',
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
									buttons: {
										justifyContent: 'flex-end',
										flexDirection: 'row',
										flexWrap: 'wrap',
									},
								},
							})
						})
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
				buttons: {
					justifyContent: 'flex-end',
					flexDirection: 'row',
					flexWrap: 'wrap',
				},
			},
		})
	} catch (err) {
		setWebLoading(false)
		console.error('Download error:', err)
		Alert.alert('Download failed', err.message || 'Unknown error')
	}
}

export async function openFile(path, showAlert, colorTheme) {
	try {
		await FileViewer.open(path, {
			showOpenWithDialog: true,
		})
	} catch (err) {
		console.warn('FileViewer failed, falling back to intent:', err)

		if (Platform.OS === 'android') {
			try {
				const mime = Mime.lookup(path) || '*/*'
				await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
					data: FileSystem.getContentUriAsync
						? await FileSystem.getContentUriAsync(path) // Only in bare workflow
						: 'file://' + path, // Might trigger FileUriExposedException
					flags: 1,
					type: mime,
				})
			} catch (intentErr) {
				console.error('Fallback intent failed:', intentErr)
				showAlert({
					title: '⚠️ Error',
					message:
						'No compatible app found to open this file. You can try opening it manually from your Downloads folder.',

					buttons: [
						{
							text: 'OK',
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
						overlay: { backgroundColor: '#000000B0' },
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
						buttons: {
							justifyContent: 'flex-end',
							flexDirection: 'row',
							flexWrap: 'wrap',
						},
					},
				})
			}
		}
	}
}

async function prepareSandboxedCopy(path) {
	const fileName = path.split('/').pop()
	const newPath = FileSystem.documentDirectory + fileName

	await FileSystem.copyAsync({
		from: path,
		to: newPath,
	})

	return newPath
}
