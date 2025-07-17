import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent, setUserProperty } from '@react-native-firebase/analytics'

const app = getApp()
const analytics = getAnalytics(app)

// Fetch captcha + pre-login setup
export async function getCaptcha() {
	try {
		// Step 1: Fetch login page
		const response = await fetch(Constants.expoConfig.extra.apiUrl + '/api/getCaptcha')
		const data = await response.json()
		if (response.status === 401) {
			console.log('api error:', data.error)
			return { error: data.error }
		}
		const { captcha, csrf } = data
		const jsessionId = data.jsessionId.value
		console.log(jsessionId, csrf)
		return {
			captcha,
			csrf,
			jsessionId,
		}
	} catch (error) {
		console.error('Error in getCaptcha:', error)
		return { error: 'Failed to fetch captcha' }
	}
}

// Login to VTOP
export async function vtopLogin(username, password) {
	if (!username || !password) {
		const isLoggedIn = await checkLogin()
		if (isLoggedIn) return { message: 'Already Logged In.', ...isLoggedIn }
	}
	return await forceVtopLogin(username, password)
}

export async function checkLogin() {
	try {
		const [[, csrf], [, jsessionId], [, username]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'username',
		])
		if (!csrf || !jsessionId || !username) return false
		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('verifyMenu', 'true')
		params.append('authorizedID', username.toUpperCase())
		params.append('x', `@(new Date().toUTCString())`)
		const response = await fetch(
			VtopConfig.domain + VtopConfig.backEndApi.commonStudentAttendance,
			{
				method: 'POST',
				headers: {
					...Headers,
					Cookie: `JSESSIONID=${jsessionId}`,
				},
				credentials: 'omit',
				body: params.toString(),
			}
		)
		if (!response.ok) return false
		console.log('Already loggedIn')
		return {
			csrf,
			jsessionId,
		}
	} catch (err) {
		console.log(err)
		return false
	}
}

export async function forceVtopLogin(username, password) {
	const [[, savedUsername], [, savedPassword]] = await AsyncStorage.multiGet([
		'username',
		'password',
	])

	username = username || savedUsername
	password = password || savedPassword

	if (!username || !password) {
		return { error: 'Missing required parameters.' }
	}
	try {
		// POST login request
		const groupYear = username.slice(0, 5)

		const response = await fetch(
			Constants.expoConfig.extra.apiUrl +
				`/api/login/autocaptcha?username=${username}&pwd=${password}`,
			{
				method: 'GET',
			}
		)
		const data = await response.json()
		if (response.status === 401) {
			console.log('api error:', data.error)
			if (data.error.toLowerCase().includes('csrf')) {
				await logEvent(analytics, 'login_failed_invalid_csrf', {
					groupYear: groupYear,
				})
			}
			return { error: data.error }
		}

		const newCsrf = data.csrf

		const newJsessId = data.cookies.find((c) => c.key === 'JSESSIONID')?.value

		// Save csrf and session ID in AsyncStorage

		await AsyncStorage.multiSet([
			['csrfToken', newCsrf],
			['sessionId', newJsessId],
			['username', username.toUpperCase()],
			['password', password],
		])

		await setUserProperty(analytics, 'group_year', groupYear)
		await logEvent(analytics, 'user_group_year', { value: groupYear })
		await logEvent(analytics, 'login_success', { groupYear })

		return { message: 'Login successful', csrf: newCsrf, jsessionId: newJsessId }
	} catch (error) {
		await AsyncStorage.multiRemove(['csrfToken', 'sessionId'])
		await logEvent(analytics, 'login_failed', { groupYear })
		console.error('Error in vtopLogin:', error)
		return { error: 'Failed to login' }
	}
}
