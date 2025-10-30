import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseDocument } from 'htmlparser2'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import { goToDrawerTab } from '../goToDrawerTab'
import { Alert, ToastAndroid } from 'react-native'
import { getTime } from '../getTime'
import { parseMarks } from '../parse/parseMarks'
import { vtopLogin } from './login'

export async function getMarks(setLoading, overrideSemID) {
	try {
		await vtopLogin()
		const [[, csrf], [, jsessionId], [, username], [, savedSem]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'username',
			'sem',
		])
		const sem = await JSON.parse(savedSem)
		console.log(sem)
		const semID = overrideSemID || sem?.semID
		if (!csrf || !jsessionId || !username || !semID) {
			await AsyncStorage.multiRemove(['csrfToken', 'sessionId'])
			ToastAndroid.show('Failed to fetch data from VTOP. Please try again.', ToastAndroid.SHORT)
			if (setLoading) setLoading(false)
			return goToDrawerTab('login')
		}
		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('semesterSubId', semID)
		params.append('authorizedID', username.toUpperCase())

		const response = await fetch(VtopConfig.domain + VtopConfig.backEndApi.StudentMarkView, {
			method: 'POST',
			headers: {
				...Headers,
				Cookie: `JSESSIONID=${jsessionId}`,
			},
			credentials: 'omit',
			body: params.toString(),
		})

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

		const marksData = parseMarks(document)

		await AsyncStorage.setItem(
			`marks-${semID}`,
			JSON.stringify({
				marksData,
				createdAt: getTime(),
			})
		)
		// console.log(marksData[0])
		return {
			marksData,
			createdAt: getTime(),
		}
	} catch (err) {
		console.error('Error fetching marks:', err)
		return { error: err }
	}
}
