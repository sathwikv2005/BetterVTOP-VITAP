const fs = require('fs')
const path = require('path')
const { withDangerousMod } = require('@expo/config-plugins')

function copyFileSync(src, dest, label) {
	if (!fs.existsSync(src)) {
		console.warn(`⚠️ ${label} not found at ${src}`)
		return
	}

	try {
		fs.mkdirSync(path.dirname(dest), { recursive: true })
		fs.copyFileSync(src, dest)
		console.log(`✅ ${label} copied to ${dest}`)
	} catch (err) {
		console.error(`❌ Failed to copy ${label}:`, err)
	}
}

module.exports = function withFirebaseConfig(config) {
	// Android: Copy google-services.json
	config = withDangerousMod(config, [
		'android',
		(config) => {
			const src = path.resolve(__dirname, '../firebase/google-services.json')
			const dest = path.join(config.modRequest.projectRoot, 'android/app/google-services.json')
			copyFileSync(src, dest, 'google-services.json')
			return config
		},
	])

	// iOS: Copy GoogleService-Info.plist
	config = withDangerousMod(config, [
		'ios',
		(config) => {
			const src = path.resolve(__dirname, '../firebase/GoogleService-Info.plist')
			const iosProjectName = config.ios?.projectName || 'YourAppName'
			const dest = path.join(
				config.modRequest.projectRoot,
				`ios/${iosProjectName}/GoogleService-Info.plist`
			)
			copyFileSync(src, dest, 'GoogleService-Info.plist')
			return config
		},
	])

	return config
}
