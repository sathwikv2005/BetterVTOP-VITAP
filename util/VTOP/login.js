import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseDocument } from 'htmlparser2'
import { DomUtils } from 'htmlparser2'
import VtopConfig from '../../vtop_config.json'
import Headers from '../../headers.json'

// Utility to extract csrf token
function extractCsrfToken(html) {
	const document = parseDocument(html)
	const inputs = DomUtils.findAll(
		(elem) => elem.name === 'input' && elem.attribs?.name === '_csrf',
		document.children
	)

	if (inputs.length > 0) {
		return inputs[0].attribs.value
	}

	return null
}

// Utility to extract captcha URL
function extractCaptchaUrl(html) {
	const document = parseDocument(html)
	const imgs = DomUtils.findAll(
		(elem) => elem.name === 'img' && elem.attribs?.src,
		document.children
	)

	if (imgs.length > 0) {
		return imgs[0].attribs.src
	}

	return null
}

// Utility to extract error message
function extractErrorMessage(html) {
	const document = parseDocument(html)
	const spans = DomUtils.findAll(
		(elem) =>
			elem.name === 'span' &&
			elem.attribs?.class?.includes('text-danger') &&
			elem.attribs?.role === 'alert',
		document.children
	)

	if (spans.length > 0) {
		return DomUtils.getText(spans[0]).trim()
	}

	return null
}

// Simple cookie parser (from Set-Cookie headers)
function extractSessionCookie(setCookieHeaders) {
	if (!setCookieHeaders) return null
	const jsession = setCookieHeaders.find((cookie) => cookie.startsWith('JSESSIONID='))
	return jsession ? jsession.split(';')[0].split('=')[1] : null
}

// Fetch captcha + pre-login setup
export async function getCaptcha() {
	try {
		// Step 1: Fetch login page
		const response = await fetch(VtopConfig.domain + VtopConfig.vtopUrls.login, {
			method: 'GET',
			headers: {
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			},
		})

		const setCookie = response.headers.get('set-cookie')?.split(',') || []
		const loginHtml = await response.text()
		const csrf = extractCsrfToken(loginHtml)
		if (!csrf) throw new Error('CSRF token not found.')

		// Step 2: Pre-login to create session
		await fetch(`${VtopConfig.domain}${VtopConfig.backEndApi.prelogin}?_csrf=${csrf}&flag=VTOP`, {
			method: 'GET',
			headers: {
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				Cookie: setCookie.join('; '),
			},
		})

		// Step 3: Extract session ID
		const jsessionId = extractSessionCookie(setCookie)

		// Step 4: Fetch captcha
		const captchaResponse = await fetch(VtopConfig.domain + VtopConfig.backEndApi.newCaptcha, {
			headers: {
				Cookie: `JSESSIONID=${jsessionId}`,
			},
		})
		const captchaHtml = await captchaResponse.text()
		const captcha = extractCaptchaUrl(captchaHtml)
		if (!captcha) throw new Error('Captcha not found.')

		return { captcha, csrf, jsessionId }
	} catch (error) {
		console.error('Error in getCaptcha:', error)
		return { error: 'Failed to fetch captcha' }
	}
}

// Login to VTOP
export async function vtopLogin(username, password, captchaStr, csrf, jsessionId) {
	if (!username || !password || !captchaStr || !csrf) {
		return { error: 'Missing required parameters.' }
	}

	try {
		// Prepare form data
		const loginParams = new URLSearchParams({
			username: username.toUpperCase(),
			password,
			captchaStr: captchaStr.toUpperCase(),
			_csrf: csrf,
		})

		// POST login request
		const response = await fetch(VtopConfig.domain + VtopConfig.vtopUrls.login, {
			method: 'POST',
			headers: {
				...Headers,
				'Content-Type': 'application/x-www-form-urlencoded',
				// Cookie: `JSESSIONID=${jsessionId}`,
			},
			body: loginParams.toString(),
		})

		if (response.status === 404) {
			return { error: 'Unauthorized. Invalid session or CSRF.' }
		}

		const responseHtml = await response.text()
		const errorText = extractErrorMessage(responseHtml)

		if (errorText) {
			return { error: errorText }
		}

		const newCsrf = extractCsrfToken(responseHtml)
		const setCookieHeader = response.headers.get('set-cookie')
		let newJsessId = jsessionId

		if (setCookieHeader) {
			const match = setCookieHeader.match(/JSESSIONID=([^;]+);/)
			if (match) {
				newJsessId = match[1]
			}
		}

		// Save csrf and session ID in AsyncStorage
		await AsyncStorage.multiSet([
			['csrfToken', newCsrf],
			['sessionId', newJsessId],
		])

		return { message: 'Login successful' }
	} catch (error) {
		console.error('Error in vtopLogin:', error)
		return { error: 'Failed to login' }
	}
}
