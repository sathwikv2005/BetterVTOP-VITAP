import { Linking } from 'react-native'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent } from '@react-native-firebase/analytics'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { extractMagicValue } from '../parse/parseVITAPWifi'

const app = getApp()
const analytics = getAnalytics(app)

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
	console.log(generateBypassUsername(username))
	const groupYear = username.slice(0, 5).toUpperCase()

	async function attemptLogin(uname) {
		const loginPageReq = await fetch(VtopConfig.VITAPWifi.baseURL + VtopConfig.VITAPWifi.loginURL, {
			headers: { ...Headers },
		})
		const html = await loginPageReq.text()
		const magic = extractMagicValue(html)

		const params = new URLSearchParams()
		params.append('username', uname)
		params.append('password', password)
		params.append('magic', magic)
		params.append('4Tredir', 'https://172.18.10.10:1000/login?')

		const loginReq = await fetch(VtopConfig.VITAPWifi.baseURL + VtopConfig.VITAPWifi.loginURL, {
			headers: { ...Headers },
			method: 'POST',
			body: params.toString(),
		})

		return loginReq.text()
	}

	try {
		let responseText = await attemptLogin(username)

		let redirectMatch = responseText.match(/window\.location="([^"]+)"/)
		if (redirectMatch) {
			await AsyncStorage.setItem('wifi-creds', JSON.stringify({ username, pwd: password }))
			await Linking.openURL(redirectMatch[1])
			return true
		}

		if (responseText.includes('user&apos;s concurrent authentication is over limit')) {
			// 🔹 Try multiple bypass attempts
			for (let i = 0; i < 3; i++) {
				const bypassUsername = generateBypassUsername(username)
				console.log(`Retrying with bypass username: ${bypassUsername}`)

				responseText = await attemptLogin(bypassUsername)
				redirectMatch = responseText.match(/window\.location="([^"]+)"/)

				if (redirectMatch) {
					await AsyncStorage.setItem(
						'wifi-creds',
						JSON.stringify({ username: bypassUsername, pwd: password })
					)
					await Linking.openURL(redirectMatch[1])
					return true
				}
			}

			return { error: 'Still failed to bypass login limit.', code: 3 }
		}

		if (responseText.includes('Firewall authentication failed')) {
			return { error: 'Firewall authentication failed. Please check your credentials.', code: 4 }
		}

		return { error: 'Failed to login', code: 1 }
	} catch (error) {
		await logEvent(analytics, 'wifi_login_failed', { groupYear })
		console.error('Error in wifiLoginVITAP:', error)
		return { error: error.message, code: 2 }
	}
}

export async function wifiLogoutVITAP() {
	Linking.openURL(VtopConfig.VITAPWifi.baseURL + VtopConfig.VITAPWifi.logoutURL)
}

export async function wifiLogoutVITAPnoLinking() {
	await fetch(VtopConfig.VITAPWifi.baseURL + VtopConfig.VITAPWifi.logoutURL)
}

function generateBypassUsername(username, attempt = 1) {
	const numberVariants = {
		0: ['⁰', '₀', '𝟘', '⓪'],
		1: ['¹', '₁', '𝟙', '①'],
		2: ['²', '₂', '𝟚', '②'],
		3: ['³', '₃', '𝟛', '③'],
		4: ['⁴', '₄', '𝟜', '④'],
		5: ['⁵', '₅', '𝟝', '⑤'],
		6: ['⁶', '₆', '𝟞', '⑥'],
		7: ['⁷', '₇', '𝟟', '⑦'],
		8: ['⁸', '₈', '𝟠', '⑧'],
		9: ['⁹', '₉', '𝟡', '⑨'],
	}

	const letterVariants = {
		A: ['À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Ā'],
		B: ['ß'],
		C: ['Ç', 'Ć', 'Č'],
		D: ['Ð'],
		E: ['È', 'É', 'Ê', 'Ë', 'Ē'],
		F: ['Ғ'],
		G: ['Ĝ', 'Ğ', 'Ģ'],
		H: ['Ħ'],
		I: ['Ì', 'Í', 'Î', 'Ï', 'Ī'],
		J: ['Ĵ'],
		K: ['Ķ'],
		L: ['Ĺ', 'Ļ', 'Ł'],
		M: ['Ṁ', 'Ṃ'],
		N: ['Ñ', 'Ń', 'Ň'],
		O: ['Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ø', 'Ō'],
		R: ['Ŕ', 'Ř', 'Ṙ'],
		S: ['Ś', 'Š', 'Ş'],
		T: ['Ţ', 'Ť', 'Ṫ'],
		U: ['Ù', 'Ú', 'Û', 'Ü', 'Ū'],
		V: ['Ṽ', 'Ṿ'],
		W: ['Ŵ', 'Ẅ'],
		X: ['Ẍ', 'Ẋ'],
		Y: ['Ý', 'Ÿ', 'Ỳ'],
		Z: ['Ź', 'Ż', 'Ž'],
	}

	const chars = username.split('')
	const indexes = []

	const changesCount = Math.min(attempt, Math.ceil(username.length / 3))

	while (indexes.length < changesCount) {
		const randomIndex = Math.floor(Math.random() * username.length)
		if (!indexes.includes(randomIndex)) indexes.push(randomIndex)
	}

	indexes.forEach((i) => {
		const ch = chars[i]
		const upper = ch.toUpperCase()

		if (/[0-9]/.test(ch)) {
			const variants = numberVariants[parseInt(ch, 10)]
			chars[i] = variants[Math.floor(Math.random() * variants.length)]
		} else if (letterVariants[upper]) {
			const variants = letterVariants[upper]
			chars[i] = variants[Math.floor(Math.random() * variants.length)]
		}
	})

	return chars.join('')
}
