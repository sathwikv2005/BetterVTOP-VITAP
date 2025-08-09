import { selectAll } from 'css-select'
import { getText } from 'domutils'

export function parseExamSchedule(document) {
	const rows = selectAll('.customTable tr', document)

	const groupedData = []
	let currentGroup = null
	let skipNextRow = false

	for (const row of rows) {
		const cells = selectAll('td', row)

		// Group title row
		if (cells.length === 1 && cells[0].attribs.colspan === '13') {
			if (currentGroup && currentGroup.data.length > 0) {
				groupedData.push(currentGroup)
			}

			const type = getText(cells[0]).trim()
			currentGroup = { type, data: [] }
			continue
		}

		// Skip if not a data row (e.g., table header)
		if (!currentGroup || cells.length !== 13 || getText(cells[0]).toLowerCase().includes('s.no')) {
			continue
		}

		const [
			_, // S.No.
			courseCode,
			courseTitle,
			courseType,
			classID,
			slot,
			examDate,
			examSession,
			reportingTime,
			examTime,
			venue,
			seatLocation,
			seatNo,
		] = cells.map((c) => getText(c).trim())

		currentGroup.data.push({
			type: currentGroup.type,
			courseCode,
			courseTitle,
			courseType,
			classID,
			slot,
			examDate,
			examSession,
			reportingTime,
			examTime,
			venue,
			seatLocation,
			seatNo,
		})
	}

	// Push the last group if it has data
	if (currentGroup && currentGroup.data.length > 0) {
		groupedData.push(currentGroup)
	}

	return groupedData
}
