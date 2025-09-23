import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseDocument } from 'htmlparser2'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import { goToDrawerTab } from '../goToDrawerTab'
import { Alert, ToastAndroid } from 'react-native'
import { getTime } from '../getTime'
import { parseMarks } from '../parse/parseExamSchedule'
import { vtopLogin } from './login'
import { parseExamSchedule } from '../parse/parseExamSchedule'

export async function getExamSchedule(setLoading, overrideSemID) {
	try {
		await vtopLogin()
		const [[, csrf], [, jsessionId], [, username], [, savedSem]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'username',
			'sem',
		])
		const sem = await JSON.parse(savedSem)

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

		const response = await fetch(
			VtopConfig.domain + VtopConfig.backEndApi.SearchExamScheduleForStudent,
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

		const examScheduleData = parseExamSchedule(document)

		await AsyncStorage.setItem(
			`examSchedule-${semID}`,
			JSON.stringify({
				examScheduleData,
				createdAt: getTime(),
			})
		)
		// console.log('schedule ', JSON.stringify(examScheduleData))
		return {
			examScheduleData,
			createdAt: getTime(),
		}
	} catch (err) {
		console.error('Error fetching exam schedule:', err)
		return { error: err }
	}
}
