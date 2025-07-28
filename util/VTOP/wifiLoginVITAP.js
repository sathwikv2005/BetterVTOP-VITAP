import { Linking } from 'react-native'
import { logEvent } from '@react-native-firebase/analytics'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { extractMagicValue } from '../parse/parseVITAPWifi'

export default async function wifiLoginVITAP(username, password) {
	const [[, savedUsername], [, savedPassword]] = await AsyncStorage.multiGet([
		'username',
		'password',
	])

	username = username || savedUsername
	password = password || savedPassword

	if (!username || !password) {
		return { error: 'Missing required parameters.' }
	}

	const groupYear = username.slice(0, 5).toUpperCase()

	try {
		const loginPageReq = await fetch(VtopConfig.VITAPWifi.baseURL + VtopConfig.VITAPWifi.loginURL, {
			headers: { ...Headers },
		})
		const html = await loginPageReq.text()
		const magic = extractMagicValue(html)

		const params = new URLSearchParams()
		params.append('username', username)
		params.append('password', password)
		params.append('magic', magic)
		params.append('4Tredir', 'https://172.18.10.10:1000/login?')

		const loginReq = await fetch(VtopConfig.VITAPWifi.baseURL + VtopConfig.VITAPWifi.loginURL, {
			headers: { ...Headers },
			method: 'POST',
			body: params.toString(),
		})

		const responseText = await loginReq.text()

		const redirectMatch = responseText.match(/window\.location="([^"]+)"/)
		if (redirectMatch) {
			const redirectUrl = redirectMatch[1]
			await AsyncStorage.setItem('wifi-creds', JSON.stringify({ username, pwd: password }))
			await Linking.openURL(redirectUrl)
			return true
		}

		if (responseText.includes('user&apos;s concurrent authentication is over limit')) {
			return {
				error:
					'Your account has reached the maximum login limit. Please log out from other devices and try again.',
				code: 3,
			}
		}

		if (responseText.includes('Firewall authentication failed')) {
			return {
				error: 'Firewall authentication failed. Please check your credentials and try again.',
				code: 4,
			}
		}

		return { error: 'Failed to login', code: 1 }
	} catch (error) {
		await logEvent(analytics, 'wifi_login_failed', { groupYear })
		console.error('Error in wifiLoginVITAP:', error)
		return { error: 'Failed to login', code: 2 }
	}
}

export async function wifiLogoutVITAP() {
	Linking.openURL(VtopConfig.VITAPWifi.baseURL + VtopConfig.VITAPWifi.logoutURL)
}

export async function wifiLogoutVITAPnoLinking() {
	await fetch(VtopConfig.VITAPWifi.baseURL + VtopConfig.VITAPWifi.logoutURL)
}
