import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useContext, useState, useEffect } from 'react'
import { WebView } from 'react-native-webview'
import { ColorThemeContext } from '../context/ColorThemeContext'
import CookieManager from '@react-native-cookies/cookies'
import { forceVtopLogin, vtopLogin } from '../util/VTOP/login'
import VtopConfig from '../vtop_config.json'
import Headers from '../headers.json'

export default function OpenVTOP({ navigation }) {
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
		const loginData = await forceVtopLogin()

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
