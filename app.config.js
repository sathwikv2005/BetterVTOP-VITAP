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
			backgroundColor: '#ffffff',
		},
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.anonymous.BetterVTOP',
		},
		android: {
			adaptiveIcon: {
				foregroundImage: './assets/adaptive-icon.png',
				backgroundColor: '#ffffff',
			},
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
