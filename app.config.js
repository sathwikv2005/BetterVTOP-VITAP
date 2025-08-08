import 'dotenv/config'
import withInstallPermission from './plugins/withInstallPermission'
import withCustomGradleFix from './plugins/custom-gradle-fix'
import withNetworkSecurityConfig from './plugins/withNetworkSecurityConfig'
const withFirebaseGoogleServicesFileSwap = require('./plugins/withFirebaseGoogleServicesFileSwap')

const variant = process.env.APP_VARIANT || 'prod'

export default {
	expo: {
		name: variant === 'dev' ? 'BetterVTOP Dev' : 'BetterVTOP',
		plugins: [
			withInstallPermission,
			withCustomGradleFix,
			'@react-native-firebase/app',
			withFirebaseGoogleServicesFileSwap,
			withNetworkSecurityConfig,
		],
		slug: 'BetterVTOP',
		version: '1.0.1',
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.anonymous.BetterVTOP',
			googleServicesFile: './firebase/GoogleService-Info.plist',
			buildNumber: '1',
		},

		android: {
			adaptiveIcon: {
				foregroundImage: './assets/icon-foreground.png',
				backgroundColor: variant === 'dev' ? '#A73D00' : '#000000',
			},
			googleServicesFile: './firebase/google-services.json',
			package: variant === 'dev' ? 'com.anonymous.BetterVTOP.dev' : 'com.anonymous.BetterVTOP',
			versionCode: 1,
		},
		notification: {
			icon: './assets/notification-icon.png',
			color: '#0b82d4',
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
