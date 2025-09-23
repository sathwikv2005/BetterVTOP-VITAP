import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseDocument } from 'htmlparser2'
import { Alert, ToastAndroid } from 'react-native'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'
import { goToDrawerTab } from '../goToDrawerTab'
import { parseAttendance } from '../parse/parseAttendance'
import { getTime } from '../getTime'
import { parseAttendanceByID } from '../parse/parseAttendanceDetails'

export async function getAttendance(setLoading, overrideSemID) {
	try {
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
			ToastAndroid.show('Failed to fetch data from VTOP. Please try again.', ToastAndroid.SHORT)
			if (setLoading) setLoading(false)
			return goToDrawerTab('login')
		}
		if (!response.ok)
			if (!response.ok) return { error: `HTTP Error: ${response.status} ${response.statusText}` }

		const html = await response.text()
		const document = parseDocument(html)

		const attendance = parseAttendance(document)

		await AsyncStorage.setItem(
			'attendance',
			JSON.stringify({
				attendance,
				createdAt: getTime(),
			})
		)

		const attendanceData = await getAttendanceDetails()
		if (attendanceData.error) return attendanceData
		return {
			attendance,
			attendanceData,
			createdAt: getTime(),
		}
	} catch (err) {
		console.error('Error fetching attendance:', err)
		return { error: err }
	}
}

export async function getAttendanceDetails(setLoading) {
	try {
		const cached = await AsyncStorage.getItem('attendance')
		const attendanceArray = cached ? JSON.parse(cached).attendance : null

		if (!attendanceArray || attendanceArray.length === 0) {
			console.log('No cached attendance')
			ToastAndroid.show('Failed to fetch data from VTOP. Please try again.', ToastAndroid.SHORT)
			if (setLoading) setLoading(false)
			return goToDrawerTab('login')
		}

		const attendanceData = await Promise.all(
			attendanceArray.map(({ courseID, classType }) =>
				fetchAttendanceDetails(setLoading, courseID, classType)
			)
		)

		// const attendanceData = [await fetchAttendanceDetails('AM_CSE1005_00100', 'ETH')]

		await AsyncStorage.setItem(
			'attendanceData',
			JSON.stringify({
				attendanceData,
				createdAt: getTime(),
			})
		)

		return attendanceData
	} catch (err) {
		console.error('Error getting attendance details:', err)
		return { error: err }
	}
}

export async function fetchAttendanceDetails(setLoading, ID, type) {
	try {
		const [[, csrf], [, jsessionId], [, username], [, savedSem]] = await AsyncStorage.multiGet([
			'csrfToken',
			'sessionId',
			'username',
			'sem',
		])
		const sem = await JSON.parse(savedSem)
		const semID = sem?.semID
		if (!csrf || !jsessionId || !username || !semID) {
			await AsyncStorage.multiRemove(['csrfToken', 'sessionId'])
			ToastAndroid.show('Failed to fetch data from VTOP. Please try again.', ToastAndroid.SHORT)
			if (setLoading) setLoading(false)
			return goToDrawerTab('login')
		}

		const params = new URLSearchParams()
		params.append('_csrf', csrf)
		params.append('semesterSubId', semID)
		params.append('registerNumber', username.toUpperCase())
		params.append('authorizedID', username.toUpperCase())
		params.append('courseId', ID)
		params.append('courseType', type)
		params.append('x', new Date().toUTCString())
		const response = await fetch(VtopConfig.domain + VtopConfig.backEndApi.ViewAttendanceDetail, {
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
		if (!response.ok)
			if (!response.ok) return { error: `HTTP Error: ${response.status} ${response.statusText}` }
		const html = await response.text()
		const document = parseDocument(html)

		const attendanceData = parseAttendanceByID(document)

		// console.log('attendance data:')
		// console.log(attendanceData)
		// console.log('attendance data log:')
		// console.log(attendanceData.attendance.log)

		await AsyncStorage.setItem(`attendance-${ID}-${type}`, JSON.stringify({ attendanceData }))
		const cachedDataStr = await AsyncStorage.getItem(`${ID}-${type}`)
		if (cachedDataStr) {
			const cachedData = JSON.parse(cachedDataStr)
			let newData = []

			for (const item of cachedData) {
				const vtopData = attendanceData.attendance.log.find(
					(x) => x.date === item.date && x.time === item.time
				)
				if (!vtopData) continue
				// If still not posted, keep user's override
				if (vtopData.status.toLowerCase() === 'not posted') {
					newData.push(item)
					continue
				}

				// If user override differs from actual VTOP data, keep it
				if (!vtopData.isPresent && vtopData.isPresent !== item.isPresent) {
					newData.push(item)
				}
			}

			await AsyncStorage.setItem(`${ID}-${type}`, JSON.stringify(newData))
		}

		return attendanceData
	} catch (err) {
		console.error('Error fetching attendance details:', err)
		return { error: err }
	}
}
