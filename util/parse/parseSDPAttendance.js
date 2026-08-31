import { selectOne, selectAll } from 'css-select'
import { textContent } from 'domutils'

function getText(element) {
	return textContent(element).trim()
}

export function parseSDPAttendance(document) {
	const modal = selectOne('#sdpAttendanceModal', document)

	if (!modal) {
		return null
	}

	const infoTable = selectOne('.modal-body table', modal)

	if (!infoTable) {
		return null
	}

	const infoRows = selectAll('tr', infoTable)

	const title = getText(selectAll('td', infoRows[0])[0])

	const summaryTable = selectOne('.modal-body table.table-bordered.text-center', modal)

	if (!summaryTable) {
		return null
	}

	const summaryRow = selectOne('tbody tr', summaryTable)

	const summaryCells = selectAll('td', summaryRow)

	const present = Number(getText(summaryCells[0])) || 0
	const onduty = Number(getText(summaryCells[1])) || 0
	const absent = Number(getText(summaryCells[2])) || 0

	const percentageText = getText(summaryCells[3])
	const percentage = Number.parseFloat(percentageText) || 0

	const calendarTable = selectOne('#sdpCalendarTable', modal)

	const logs = calendarTable
		? selectAll('tbody tr', calendarTable).map((row) => {
				const cells = selectAll('td', row)

				return {
					date: getText(cells[1]),
					day: getText(cells[2]),
					dayType: getText(cells[3]),
					status: getText(cells[4]),
					punchTime: getText(cells[5]),
				}
			})
		: []

	return {
		title,
		present,
		absent,
		onduty,
		percentage,
		logs,
		isSDP: true,
	}
}
