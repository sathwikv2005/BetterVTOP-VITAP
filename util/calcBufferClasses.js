export default function calcBufferClasses(minPercent, attended, absent) {
	const p = parseInt(minPercent)
	const a = parseInt(attended)
	const t = a + parseInt(absent)
	const percentage = (a * 100) / t
	if (percentage < p) return classesNeeded(a, t, p)
	return classesCanSkip(a, t, p)
}

function classesNeeded(a, t, p) {
	const currentPercentage = Math.ceil((a / t) * 100)
	if (currentPercentage >= p) return 0 // already at or above target

	const x = (p * t - 100 * a) / (100 - p)
	return Math.ceil(x) // round up since you can't attend a fraction of a class
}

function classesCanSkip(a, t, p) {
	const x = (a * 100) / p - t
	return Math.floor(x >= 0 ? x : 0)
}
