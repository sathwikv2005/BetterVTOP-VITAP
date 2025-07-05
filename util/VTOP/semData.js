import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseDocument } from 'htmlparser2'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import { goToDrawerTab } from '../goToDrawerTab'
import { Alert, ToastAndroid } from 'react-native'
import { getTime } from '../getTime'
import { parseSemesterOptions } from '../parse/parseSemData'

export async function getSemData(setLoading) {
	try {
		const [[, csrf], [, jsessionId], [, username], [, savedSem]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'username',
			'sem',
		])
		console.log(savedSem)
		if (!csrf || !jsessionId || !username) {
			console.log(csrf, jsessionId, username)
			await AsyncStorage.multiRemove(['csrfToken', 'sessionId'])
			ToastAndroid.show('Failed to fetch data from VTOP. Please try again.', ToastAndroid.SHORT)
			if (setLoading) setLoading(false)
			return goToDrawerTab('login')
		}

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

		if (response.status === 404) {
			console.log(await response.text())
			await AsyncStorage.multiRemove(['csrfToken', 'sessionId'])
			ToastAndroid.show('Failed to fetch data from VTOP. Please try again.', ToastAndroid.SHORT)
			if (setLoading) setLoading(false)
			return goToDrawerTab('login')
		}
		if (!response.ok) return { error: `HTTP Error: ${response.status} ${response.statusText}` }

		const html = await response.text()
		const document = parseDocument(html)

		const semData = parseSemesterOptions(document)

		await AsyncStorage.setItem(
			'semData',
			JSON.stringify({
				semData,
				createdAt: getTime(),
			})
		)
		if (!savedSem || savedSem === null) {
			await AsyncStorage.setItem('sem', JSON.stringify(semData[0]))
		}
		// console.log(semData[0])
		return {
			semData,
			createdAt: getTime(),
		}
	} catch (err) {
		console.error('Error fetching sem data:', err)
		return { error: err }
	}
}
