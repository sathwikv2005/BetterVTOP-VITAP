import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseDocument } from 'htmlparser2'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import { goToDrawerTab } from '../goToDrawerTab'
import { parseTimeTable } from '../parse/parseTimeTable'
import { vtopLogin } from './login'
import { Alert } from 'react-native'

export async function getTimeTable(overrideSemID) {
	try {
		const [[, csrf], [, jsessionId], [, username]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'username',
		])
		console.log(jsessionId, csrf, username)
		const semID = overrideSemID || 'AP2024254'
		if (!csrf || !jsessionId || !username || !semID) {
			await AsyncStorage.multiRemove(['csrfToken', 'sessionId', 'username'])
			goToDrawerTab('login')
		}

		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('semesterSubId', semID)
		params.append('authorizedID', username.toUpperCase())
		params.append('x', new Date().toUTCString())
		const response = await fetch(VtopConfig.domain + VtopConfig.backEndApi.viewTimeTable, {
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
			console.log('new login created')
			const login = await vtopLogin()
			if (login.error)
				return Alert.alert(
					'Login setup failed',
					`Failed to login! Please try again later. \n error: ${login.error}`
				)
			return await getTimeTable(overrideSemID)
		}
		if (!response.ok) throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)

		const html = await response.text()
		const document = parseDocument(html)

		const timetable = parseTimeTable(document)

		await AsyncStorage.setItem('timetable', JSON.stringify(timetable))
		// console.log(timetable[0])
		return timetable
	} catch (err) {
		console.error('Error fetching time table:', err)
		throw err
	}
}
