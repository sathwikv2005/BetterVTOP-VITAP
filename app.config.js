import 'dotenv/config'
import withInstallPermission from './plugins/withInstallPermission'
import withCustomGradleFix from './plugins/custom-gradle-fix'

const variant = process.env.APP_VARIANT || 'prod'

export default {
	expo: {
		name: variant === 'dev' ? 'BetterVTOP Dev' : 'BetterVTOP',
		plugins: [withInstallPermission, withCustomGradleFix],
		slug: 'BetterVTOP',
		version: '0.6.0',
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.anonymous.BetterVTOP',
			buildNumber: '1',
		},

		android: {
			icon: './assets/icon.png',
			package: variant === 'dev' ? 'com.anonymous.BetterVTOP.dev' : 'com.anonymous.BetterVTOP',
			versionCode: 1,
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
