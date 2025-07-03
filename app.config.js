import 'dotenv/config'
const variant = process.env.APP_VARIANT || 'prod'
export default {
	expo: {
		name: variant === 'dev' ? 'BetterVTOP Dev' : 'BetterVTOP',
		slug: 'BetterVTOP',
		version: '0.1.0',
		android: {
			versionCode: 1,
		},
		ios: {
			buildNumber: '1',
		},
		orientation: 'portrait',
		icon: './assets/icon.png',
		backgroundColor: '#000000',
		userInterfaceStyle: 'light',
		newArchEnabled: true,
		splash: {
			image: './assets/splash-icon.png',
			resizeMode: 'contain',
			backgroundColor: '#000000',
		},
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.anonymous.BetterVTOP',
		},
		android: {
			icon: './assets/icon.png',
			package: variant === 'dev' ? 'com.anonymous.BetterVTOP.dev' : 'com.anonymous.BetterVTOP',
		},
		web: {
			favicon: './assets/favicon.png',
		},
		extra: {
			apiUrl: process.env.API_URL,
			eas: {
				projectId: '4e9ccbce-aa1b-4ef0-89c1-06a8de0ce1a9',
			},
		},
	},
}
