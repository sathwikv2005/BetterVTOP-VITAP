let openOtpUI = null

export const registerOtpHandler = (handler) => {
	openOtpUI = handler
}

export const requestOtp = () => {
	if (!openOtpUI) {
		throw new Error('OTP handler not registered')
	}

	return new Promise((resolve, reject) => {
		openOtpUI({ resolve, reject })
	})
}
