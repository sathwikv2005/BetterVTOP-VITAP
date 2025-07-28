import { parseDocument } from 'htmlparser2'
import { selectOne } from 'css-select'
import { getAttributeValue } from 'domutils'

/**
 * Extracts the "magic" value from given HTML string
 * @param {string} html - The raw HTML string
 * @returns {string|null} - The magic value or null if not found
 */
export function extractMagicValue(html) {
	try {
		const document = parseDocument(html)

		const magicInput = selectOne('input[name="magic"]', document)

		if (magicInput) {
			return getAttributeValue(magicInput, 'value') || null
		}

		return null
	} catch (err) {
		console.error('Failed to parse HTML:', err)
		return null
	}
}
