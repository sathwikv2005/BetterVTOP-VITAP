import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import VtopConfig from '../../vtop_config.json'

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
	const isLoggedIn = await checkLogin()

	if (isLoggedIn) return { message: 'Already Logged In.' }
	const [[, savedUsername], [, savedPassword]] = await AsyncStorage.multiGet([
		'username',
		'password',
	])
	if (!username) username = savedUsername
	if (!password) password = savedPassword
	if (!username || !password) {
		return { error: 'Missing required parameters.' }
	}

	try {
		// POST login request
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
			return { error: data.error }
		}

		const newCsrf = data.csrf

		const newJsessId = data.cookies.find((c) => c.key === 'JSESSIONID')?.value

		console.log('Cookies:', data.cookies)

		// Save csrf and session ID in AsyncStorage
		console.log('new:', newJsessId, newCsrf)
		await AsyncStorage.multiSet([
			['csrfToken', newCsrf],
			['sessionId', newJsessId],
			['username', username.toUpperCase()],
			['password', password],
		])

		return { message: 'Login successful' }
	} catch (error) {
		await AsyncStorage.multiRemove(['csrfToken', 'sessionId', 'username'])
		console.error('Error in vtopLogin:', error)
		return { error: 'Failed to login' }
	}
}

export async function checkLogin() {
	try {
		const [[, csrf], [, jsessionId], [, username]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'username',
		])
		if (!csrf || !jsessionId || !username) return false
		const response = await fetch(
			VtopConfig.domain + VtopConfig.vtopUrls.homepage + `?_csrf=${csrf}`,
			{
				method: 'GET',
				headers: {
					...Headers,
					Cookie: `JSESSIONID=${jsessionId}`,
				},
				credentials: 'omit',
			}
		)
		if (!response.ok) return false
		console.log('Already loggedIn')
		return true
	} catch (err) {
		console.log(err)
		return false
	}
}
