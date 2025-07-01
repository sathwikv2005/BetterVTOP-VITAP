import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseDocument } from 'htmlparser2'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import { goToDrawerTab } from '../goToDrawerTab'
import { parseAttendance } from '../parse/parseAttendance'
import { getTime } from '../getTime'

export async function getAttendance(overrideSemID) {
	try {
		const [[, csrf], [, jsessionId], [, username]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'username',
		])
		const semID = overrideSemID || 'AP2024254'
		if (!csrf || !jsessionId || !username || !semID) {
			await AsyncStorage.multiRemove(['csrfToken', 'sessionId'])
			return goToDrawerTab('login')
		}

		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('semesterSubId', semID)
		params.append('authorizedID', username.toUpperCase())
		params.append('x', new Date().toUTCString())
		const response = await fetch(VtopConfig.domain + VtopConfig.backEndApi.ViewStudentAttendance, {
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
			return goToDrawerTab('login')
		}
		if (!response.ok)
			if (!response.ok) return { error: `HTTP Error: ${response.status} ${response.statusText}` }

		const html = await response.text()
		console.log(html)
		const document = parseDocument(html)

		const attendance = parseAttendance(document)

		await AsyncStorage.setItem(
			'attendance',
			JSON.stringify({
				attendance,
				createdAt: getTime(),
			})
		)

		return attendance
	} catch (err) {
		console.error('Error fetching attendance:', err)
		return { error: err }
	}
}
