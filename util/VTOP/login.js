import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { parseDocument } from 'htmlparser2'
import { selectOne } from 'css-select'
import Constants from 'expo-constants'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent, setUserProperty } from '@react-native-firebase/analytics'
import { requestOtp } from './otpManager'

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
		const [[, csrf], [, jsessionId], [, regNo]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'regNo',
		])
		if (!csrf || !jsessionId || !regNo) return false
		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('verifyMenu', 'true')
		params.append('authorizedID', regNo.toUpperCase())
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
			},
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

export async function forceVtopLogin(username, password, tries) {
	if (!tries) tries = 0
	const [[, savedUsername]] = await AsyncStorage.multiGet(['username'])
	const savedPassword = await SecureStore.getItemAsync('password')

	username = username || savedUsername
	password = password || savedPassword

	if (!username || !password) {
		return { error: 'Missing required parameters.' }
	}
	let groupYear = username.slice(0, 5).toUpperCase()
	try {
		// POST login request

		const response = await fetch(Constants.expoConfig.extra.apiUrl + `/api/login/autocaptcha`, {
			// const response = await fetch(`http://192.168.127.26:6700/api/login/autocaptcha`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, pwd: password }),
		})

		const data = await response.json()
		if (response.status === 500) {
			console.error('Error from the API:', data.error)
			return { error: 'Failed to login. VTOP server might be down. Please try again later.' }
		}
		if (response.status === 401) {
			console.log('api error:', data.error)
			if (data.error.toLowerCase().includes('csrf')) {
				if (tries < 5) return await forceVtopLogin(username, password, tries + 1)
				await logEvent(analytics, 'login_failed_invalid_csrf', {
					groupYear: groupYear,
				})
			} else if (data.error.toLowerCase().includes('captcha')) {
				if (tries < 5) return await forceVtopLogin(username, password, tries + 1)
				await logEvent(analytics, 'login_failed_invalid_captcha', {
					groupYear: groupYear,
				})
			} else if (data.error.toLowerCase().includes('otp')) {
				await SecureStore.setItemAsync('password', password)
				return await validateOTP(data.cookies, data.csrf, username)
			}
			await clearVtopAuth()
			return { error: data.error }
		}
		const newCsrf = data.csrf

		const newJsessId = data.cookies.find((c) => c.key === 'JSESSIONID')?.value

		if (!newCsrf || !newJsessId) {
			if (tries < 5) return await forceVtopLogin(username, password, tries + 1)
			console.error('[VTOP login] Invalid login response', data)
			await clearVtopAuth()
			await logEvent(analytics, 'login_failed_invalid_response', {
				hasCsrf: !!newCsrf,
				hasSession: !!newJsessId,
			})
			return { error: 'Login failed. Invalid session data.' }
		}

		const regNo = await getRegNo(newJsessId)

		if (regNo.error) {
			return { error: regNo.error }
		}

		if (!regNo.value) {
			return { error: 'Failed to login' }
		}

		// Save csrf and session ID in AsyncStorage
		await AsyncStorage.multiSet([
			['csrfToken', newCsrf],
			['sessionId', newJsessId],
			['username', username.toUpperCase()],
			['regNo', regNo.value.toUpperCase()],
		])

		groupYear = regNo.slice(0, 5).toUpperCase()

		await Promise.all([
			SecureStore.setItemAsync('password', password),

			setUserProperty(analytics, 'group_year', groupYear),

			logEvent(analytics, 'user_group_year', {
				groupYear,
				group: groupYear.slice(2),
				year: groupYear.slice(0, 2),
			}),

			logEvent(analytics, 'login_success', { groupYear }),
		])

		return { message: 'Login successful', csrf: newCsrf, jsessionId: newJsessId }
	} catch (error) {
		await AsyncStorage.multiRemove(['csrfToken', 'sessionId'])
		await logEvent(analytics, 'login_failed', { groupYear })
		console.error('Error in vtopLogin:', error)
		return { error: 'Failed to login' }
	}
}

async function getRegNo(cookie) {
	try {
		const response = await fetch(VtopConfig.domain + VtopConfig.vtopUrls.homepage, {
			method: 'GET',
			headers: {
				...Headers,
				Cookie: `JSESSIONID=${cookie}`,
			},
			credentials: 'omit',
		})
		if (response.status === 404) {
			await AsyncStorage.multiRemove(['csrfToken', 'sessionId'])
			ToastAndroid.show('Failed to fetch data from VTOP. Please try again.', ToastAndroid.SHORT)
			return { error: `Session not found` }
		}
		if (!response.ok) return { error: `HTTP Error: ${response.status} ${response.statusText}` }

		const html = await response.text()
		const document = parseDocument(html)
		const input = selectOne('#authorizedIDX', document)

		const value = input?.attribs?.value

		return { value }
	} catch (err) {
		return { error: 'failed to fetch registraion number' }
	}
}

export async function clearVtopAuth() {
	try {
		// Clear AsyncStorage items
		await AsyncStorage.multiRemove([
			'username',
			'csrfToken',
			'sessionId', // JSESSIONID
		])

		await SecureStore.deleteItemAsync('password')

		return true
	} catch (err) {
		console.error('[VTOP login] Failed to clear VTOP credentials', err)
		return false
	}
}

export async function validateOTP(cookie, csrf, username) {
	try {
		const otp = await requestOtp()

		if (!otp || otp.length < 6) return { error: 'OTP must be 6 digits.' }

		const response = await fetch(
			Constants.expoConfig.extra.apiUrl +
				`/api/login/validate/otp?otp=${otp}&jsessionId=${cookie}&csrf=${csrf}`,
		)

		const data = await response.json()

		if (response.status !== 200) {
			return { error: data.error }
		}

		if (csrf && cookie)
			await AsyncStorage.multiSet([
				['csrfToken', csrf],
				['sessionId', cookie],
			])
		await AsyncStorage.setItem('username', username.toUpperCase())

		return await vtopLogin()
	} catch (err) {
		if (err.message === 'OTP cancelled') {
			console.log('OTP cancelled')
			return { error: 'Login cancelled' }
		}

		console.error('OTP validation failed:', err)
		return { error: 'Something went wrong. Please try again.' }
	}
}
