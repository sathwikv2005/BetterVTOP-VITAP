import { selectAll, selectOne } from 'css-select'
import { getText, getChildren } from 'domutils'

export function parseMarks(document) {
	const courseRows = selectAll('tr.tableContent', document)

	const result = []

	for (let i = 0; i < courseRows.length; i++) {
		const row = courseRows[i]
		const columns = selectAll('td', row)

		// A valid course row has 9 columns
		if (columns.length !== 9) continue

		const course = {
			classNbr: getText(columns[1]).trim(),
			courseCode: getText(columns[2]).trim(),
			courseTitle: getText(columns[3]).trim(),
			courseType: getText(columns[4]).trim(),
			faculty: getText(columns[6]).trim(),
			slot: getText(columns[7]).trim(),
			mode: getText(columns[8]).trim(),
			marks: [],
		}

		// Try to find the next row which contains marks
		const nextRow = courseRows[i + 1]
		if (!nextRow) {
			result.push(course)
			continue
		}

		const marksTable = selectOne('table.customTable-level1', nextRow)
		if (!marksTable) {
			result.push(course)
			continue
		}

		const markRows = selectAll('tr.tableContent-level1', marksTable)
		for (const markRow of markRows) {
			const outputs = selectAll('output', markRow)
			if (outputs.length >= 7) {
				course.marks.push({
					title: getText(outputs[1]).trim(),
					max: getText(outputs[2]).trim(),
					weightagePercent: getText(outputs[3]).trim(),
					status: getText(outputs[4]).trim(),
					scored: getText(outputs[5]).trim(),
					weightageMark: getText(outputs[6]).trim(),
					remark: outputs[7] ? getText(outputs[7]).trim() : '',
				})
			}
		}

		result.push(course)
		i++ // skip the next row, already processed
	}

	return result
}
