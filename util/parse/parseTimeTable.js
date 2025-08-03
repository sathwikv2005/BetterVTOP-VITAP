import { selectAll, selectOne } from 'css-select'

export function parseTimeTable(document) {
	const table = selectOne('#timeTableStyle', document)
	const rows = selectAll('tr', table)
	const courseMap = getCourseTitleMap(document)
	const facultyMap = getFacultyMap(document)
	console.log('>', facultyMap)
	// Extract time slots
	const thTimeCells = selectAll('td', rows[0]).slice(2)
	const thEndTimeCells = selectAll('td', rows[1]).slice(1)
	const thTimeSlots = thTimeCells.map((cell, i) => ({
		start: cell.children[0]?.data?.trim().split(' - ')[0],
		end: thEndTimeCells[i]?.children[0]?.data?.trim().split(' - ')[0],
	}))

	const labTimeCells = selectAll('td', rows[2]).slice(2)
	const labEndTimeCells = selectAll('td', rows[3]).slice(1)
	const labTimeSlots = labTimeCells.map((cell, i) => ({
		start: cell.children[0]?.data?.trim().split(' - ')[0],
		end: labEndTimeCells[i]?.children[0]?.data?.trim().split(' - ')[0],
	}))

	const timetable = []

	for (let i = 4; i < rows.length; i += 2) {
		const theoryRow = rows[i]
		const labRow = rows[i + 1]

		const dayName = selectAll('td', theoryRow)[0].children[0].data.trim().toUpperCase()

		const theoryCells = selectAll('td', theoryRow).slice(2)
		const labCells = labRow ? selectAll('td', labRow).slice(2) : []

		const classes = []

		// ---------- THEORY CLASSES ----------
		theoryCells.forEach((cell, index) => {
			const text = cell.children
				?.map((c) => c.data || '')
				.join('')
				.trim()
			const bgcolor = cell.attribs?.bgcolor

			if (text && text !== '-' && text !== 'Lunch' && bgcolor === '#CCFF33') {
				const textArray = text.split('-').slice(0, -1)
				const slot = textArray[0]
				const courseCode = textArray[1]
				const venue = `${textArray[3]}, ${textArray[4]}${textArray[5] ? `-${textArray[5]}` : ''}`

				classes.push({
					type: 'theory',
					slot,
					courseCode,
					courseTitle: courseMap[courseCode]?.split('-')[1] || courseCode,
					faculty: facultyMap[`${courseCode}-${slot}`] || null, // ✅ FIXED
					venue,
					class: text,
					timings: { ...thTimeSlots[index] },
				})
			}
		})

		// ---------- LAB CLASSES ----------
		labCells.forEach((cell, index) => {
			const text = cell.children
				?.map((c) => c.data || '')
				.join('')
				.trim()
			const bgcolor = cell.attribs?.bgcolor

			if (text && text !== '-' && text !== 'Lunch' && bgcolor === '#CCFF33') {
				const textArray = text.split('-').slice(0, -1)
				const slot = textArray[0]
				const courseCode = textArray[1]
				const venue = `${textArray[3]}, ${textArray[4]}${textArray[5] ? `-${textArray[5]}` : ''}`

				classes.push({
					type: 'lab',
					slot,
					courseCode,
					courseTitle: courseMap[courseCode]?.split('-')[1] || courseCode,
					faculty: facultyMap[`${courseCode}-${slot}`] || null, // ✅ FIXED
					venue,
					class: text,
					timings: { ...labTimeSlots[index + 1] },
				})
			}
		})

		timetable.push({ day: dayName, classes })
	}

	return timetable
}

// ---------- COURSE TITLE MAP ----------
export function getCourseTitleMap(document) {
	const courseMap = {}
	const rows = selectAll('#getStudentDetails table tr', document)

	for (let row of rows) {
		const cols = selectAll('td', row)
		if (cols.length < 3) continue

		const courseCell = cols[2]
		const textLines = courseCell.children
			.filter((c) => c.name === 'p')
			.map((p) => p.children[0]?.data?.trim())

		if (!textLines[0]) continue
		const [code, title] = textLines[0].split(' - ')
		if (code && title) courseMap[code.trim()] = `${code.trim()} - ${title.trim()}`
	}

	return courseMap
}

// ---------- FACULTY MAP ----------
export function getFacultyMap(document) {
	const rows = selectAll('#getStudentDetails table tr', document)
	const map = {}

	rows.forEach((row) => {
		const cols = selectAll('td', row)
		if (cols.length < 9) return

		// Extract course code text from the <p> tag in column 3
		const courseCell = cols[2]
		const courseLine = selectAll('p', courseCell)[0]?.children?.[0]?.data?.trim() || ''
		const courseCode = courseLine.split('-')[0]?.trim()

		// Extract slot text from the <p> tag in column 8
		const slotCell = cols[7]
		const slotLine = selectAll('p', slotCell)[0]?.children?.[0]?.data?.trim() || ''

		// Extract faculty text from the <p> tag in column 9
		const facultyCell = cols[8]
		const facultyLine = selectAll('p', facultyCell)[0]?.children?.[0]?.data?.trim() || ''

		if (!courseCode || !slotLine || !facultyLine) return

		const facultyName = facultyLine.replace(/\s*-\s*$/, '').trim()

		// Handle multiple slots like "B1+TB1 -"
		slotLine
			.replace('-', '')
			.split('+')
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((slot) => {
				map[`${courseCode}-${slot}`] = facultyName
				// Also support "TE1" -> "E1"
				if (slot.startsWith('T')) {
					map[`${courseCode}-${slot.slice(1)}`] = facultyName
				}
			})
	})

	return map
}
