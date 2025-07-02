export function formatCourseTitle(title, maxLength = 30) {
	const parts = title.split(' - ')
	const trimmed = parts.slice(0, 2).join(' ')

	if (trimmed.length <= maxLength) return trimmed

	return trimmed.slice(0, maxLength - 3).trimEnd() + '...'
}
