import { getElementById, getElementsByTagName, getText } from 'domutils'

export function parseAttendanceByID(dom) {
	const clean = (node) => getText(node)?.replace(/\s+/g, ' ').trim() || ''

	const attendance = {
		present: 0,
		absent: 0,
		onduty: 0,
		attended: 0,
		total: 0,
		percentage: 0,
		log: [],
	}

	// Get summary table and find first <tr> with <td> (not <th>)
	const summaryTable = getElementById('StudentCourseDetailDataTable', dom.children)
	if (!summaryTable) {
		console.warn('summaryTable not found')
		return { attendance }
	}
	const summaryRows = getElementsByTagName('tr', summaryTable, true)
	const dataRow = summaryRows.find((row) => {
		const cells = getElementsByTagName('td', row.children || [], true)
		if (cells.length < 4) return false
		const firstCell = clean(cells[0]).toLowerCase()
		return firstCell !== 'class group' // skip header row
	})

	if (!dataRow) return { attendance }

	const cells = getElementsByTagName('td', dataRow, true)

	const courseDetails = clean(cells[1])
	const classDetails = clean(cells[2])
	const faculty = clean(cells[3])

	const summarySpans = getElementsByTagName('span', [cells[6]], true)

	for (let i = 0; i < summarySpans.length; i++) {
		const text = clean(summarySpans[i])

		if (/^Present\s*:/.test(text)) {
			attendance.present = parseInt(text.split(':')[1]?.trim()) || 0
		} else if (/^Absent\s*:/.test(text)) {
			attendance.absent = parseInt(text.split(':')[1]?.trim()) || 0
		} else if (/^On Duty\s*:/.test(text)) {
			attendance.onduty = parseInt(text.split(':')[1]?.trim()) || 0
		} else if (/^Attended\s*:/.test(text)) {
			attendance.attended = parseInt(text.split(':')[1]?.trim()) || 0
		} else if (/^Total Class\s*:/.test(text)) {
			attendance.total = parseInt(text.split(':')[1]?.trim()) || 0
		} else if (/^Percentage\s*:/.test(text)) {
			const innerSpans = getElementsByTagName('span', summarySpans[i], true)
			const percentText =
				innerSpans.length > 1 ? clean(innerSpans[1]) : innerSpans.length ? clean(innerSpans[0]) : ''
			if (percentText) attendance.percentage = parseFloat(percentText.replace('%', '') || '0')
		}
	}

	// Attendance detail rows
	const detailTable = getElementById('StudentAttendanceDetailDataTable', dom.children)
	if (!detailTable) {
		console.warn('detailTable not found')
		return {
			courseDetails,
			classDetails,
			faculty,
			attendance,
		}
	}
	const rows = getElementsByTagName('tr', detailTable, true)

	for (const row of rows) {
		const cols = getElementsByTagName('td', row, true)
		if (cols.length < 6) continue

		const date = clean(cols[1])
		const slot = clean(cols[2])
		const dayTime = clean(cols[3])
		const [day, time] = (dayTime || ' / ').split(' / ').map((s) => s.trim())
		const status = clean(cols[4])
		const reason = clean(cols[5]) || null

		// Skip header row if accidentally picked
		if (date === 'Date' && slot === 'Slot' && status === 'Status') continue

		attendance.log.push({
			isPresent: ['present', 'on duty'].includes(status.toLowerCase()),
			status,
			date,
			day,
			time,
			slot,
			reason: reason === 'Remarks' ? null : reason,
		})
	}

	return {
		courseDetails,
		classDetails,
		faculty,
		attendance,
	}
}
