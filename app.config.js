import 'dotenv/config'

export default {
	expo: {
		name: 'BetterVTOP',
		slug: 'BetterVTOP',
		version: '1.0.0',
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
			package: 'com.anonymous.BetterVTOP',
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
