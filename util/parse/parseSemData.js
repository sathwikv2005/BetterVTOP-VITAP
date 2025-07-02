import { selectAll } from 'css-select'

export function parseSemesterOptions(document) {
	const options = selectAll('select#semesterSubId option', document)

	return options
		.filter((opt) => opt.attribs?.value && opt.attribs.value !== '')
		.map((opt) => ({
			semID: opt.attribs.value,
			sem: opt.children[0]?.data?.trim() || '',
		}))
}
