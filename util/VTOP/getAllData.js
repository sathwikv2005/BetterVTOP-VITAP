import { goToDrawerTab } from '../goToDrawerTab'
import { getAttendance } from './attendance'
import { vtopLogin } from './login'
import { getSemData } from './semData'
import { getTimeTable } from './timeTable'

export async function getAllData() {
	const login = await vtopLogin()
	if (login.error) {
		if (login.error.includes('csrf')) return { error: 'failed to login, please try again.' }
		return goToDrawerTab('login')
	}

	const vtopData = await fetchVtopData()
	return vtopData
}

export async function fetchVtopData() {
	const semData = await getSemData()
	if (semData.error) return semData
	const timetable = await getTimeTable()
	if (timetable.error) return timetable
	const attendance = await getAttendance()
	if (attendance.error) return attendance
	return {
		semData,
		timetable,
		attendance,
	}
}
