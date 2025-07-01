import { selectOne, selectAll } from 'css-select'
import { textContent } from 'domutils'

export function parseAttendance(doc) {
	const table = selectOne('#AttendanceDetailDataTable', doc)
	if (!table) return []

	const rows = selectAll('tbody > tr', table)
	const attendance = []

	for (const row of rows) {
		const cols = selectAll('td', row)
		if (cols.length < 11) continue

		const getSpanText = (col) => textContent(selectOne('span', col))?.trim() || ''

		const onclick = selectOne('a', cols[10])?.attribs?.onclick
		const match = onclick?.match(
			/callStudentAttendanceDetailDisplay\('([^']+)','([^']+)','([^']+)','([^']+)'\)/
		)

		const [_, semesterId, regNo, courseID, classType] = match || []

		attendance.push({
			courseDetails: getSpanText(cols[2]),
			classDetails: getSpanText(cols[3]),
			faculty: getSpanText(cols[4]),
			attended: getSpanText(cols[5]),
			totalClasses: getSpanText(cols[6]),
			percentage: getSpanText(cols[7])?.replace('%', ''),
			semesterId,
			courseID,
			classType,
			regNo,
		})
	}

	return attendance
}
