import { goToDrawerTab } from '../goToDrawerTab'
import { getAttendance } from './attendance'
import { vtopLogin } from './login'
import { getSemData } from './semData'
import { getTimeTable } from './timeTable'
import { Alert, ToastAndroid } from 'react-native'

export async function getAllData(setLoading) {
	const login = await vtopLogin()
	if (login.error) {
		if (login.error.includes('csrf')) {
			if (setLoading) setLoading(false)
			return { error: 'failed to login, please try again.' }
		}
		ToastAndroid.show('Failed to fetch data from VTOP. Please try again.', ToastAndroid.SHORT)
		if (setLoading) setLoading(false)
		return goToDrawerTab('login')
	}

	const vtopData = await fetchVtopData(setLoading)
	return vtopData
}

export async function fetchVtopData(setLoading) {
	const semData = await getSemData(setLoading)
	if (semData.error) return semData
	const timetable = await getTimeTable(setLoading)
	if (timetable.error) return timetable
	const attendance = await getAttendance(setLoading)
	if (attendance.error) return attendance
	return {
		semData,
		timetable,
		attendance,
	}
}
