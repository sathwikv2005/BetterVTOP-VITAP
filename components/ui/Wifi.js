import { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Loading from '../Loading'
import { goToDrawerTab } from '../../util/goToDrawerTab'

import FontAwesome from '@expo/vector-icons/FontAwesome'
import Entypo from '@expo/vector-icons/Entypo'
import wifiLoginVITAP, {
	wifiLogoutVITAP,
	wifiLogoutVITAPnoLinking,
} from '../../util/VTOP/wifiLoginVITAP'
import { useAlert } from 'custom-react-native-alert'

export default function Wifi() {
	const { showAlert, hideAlert } = useAlert()
	const [userName, setUserName] = useState(null)
	const [pwd, setPwd] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)
	const { colorTheme } = useContext(ColorThemeContext)

	function onChangeUserName(newUserName) {
		setUserName(newUserName)
	}
	function onChangePassword(newPassword) {
		setPwd(newPassword)
	}

	async function handleLogin() {
		setLoading(true)
		let login = await wifiLoginVITAP(userName, pwd)
		console.log(login)
		if (login && login.error && login.code === 3) {
			await wifiLogoutVITAPnoLinking()
			login = await wifiLoginVITAP(userName, pwd)
		}
		if (login && login.error && login.code === 3) {
			setLoading(false)
			return showAlert({
				title: '⚠️ Login Failed',
				message:
					'Your account has reached the maximum login limit. Please log out from other devices before trying again.',

				styles: {
					overlay: {
						backgroundColor: '#000000B0',
					},
					container: {
						backgroundColor: colorTheme.main.secondary,
						width: '85%',
						padding: 16,
						borderRadius: 12,
						// borderColor: colorTheme.main.primary,
					},
					title: {
						color: '#FF5A5F',
						fontSize: 18,
						fontWeight: '600',
						textAlign: 'center',
						marginBottom: 6,
					},
					message: {
						color: colorTheme.main.text,
						fontSize: 15,
						textAlign: 'center',
						marginBottom: 12,
					},
					okButton: {
						backgroundColor: colorTheme.accent.primary,
						paddingVertical: 10,
						borderRadius: 8,
					},
					okText: {
						color: colorTheme.main.primary,
						fontWeight: 'bold',
						textAlign: 'center',
					},
				},
			})
		}
		if (login && login.error && login.code === 4) {
			setLoading(false)
			return showAlert({
				title: '⚠️ Login Failed',
				message:
					'Authentication with the Wi-Fi portal was unsuccessful. Please verify your username and password, then try again.',
				styles: {
					overlay: {
						backgroundColor: '#000000B0',
					},
					container: {
						backgroundColor: colorTheme.main.secondary,
						width: '85%',
						padding: 16,
						borderRadius: 12,
						borderColor: colorTheme.main.primary,
					},
					title: {
						color: '#FF5A5F',
						fontSize: 18,
						fontWeight: '600',
						textAlign: 'center',
						marginBottom: 6,
					},
					message: {
						color: colorTheme.main.text,
						fontSize: 15,
						textAlign: 'center',
						marginBottom: 12,
					},
					okButton: {
						backgroundColor: colorTheme.accent.primary,
						paddingVertical: 10,
						borderRadius: 8,
					},
					okText: {
						color: colorTheme.main.primary,
						fontWeight: 'bold',
						textAlign: 'center',
					},
				},
			})
		}
		if (login && login.error) {
			setLoading(false)
			return showAlert({
				title: '⚠️ Login Failed',
				message: login.error,
				styles: {
					overlay: {
						backgroundColor: '#000000B0',
					},
					container: {
						backgroundColor: colorTheme.main.secondary,
						width: '85%',
						padding: 16,
						borderRadius: 12,
						borderColor: colorTheme.main.primary,
					},
					title: {
						color: '#FF5A5F',
						fontSize: 18,
						fontWeight: '600',
						textAlign: 'center',
						marginBottom: 6,
					},
					message: {
						color: colorTheme.main.text,
						fontSize: 15,
						textAlign: 'center',
						marginBottom: 12,
					},
					okButton: {
						backgroundColor: colorTheme.accent.primary,
						paddingVertical: 10,
						borderRadius: 8,
					},
					okText: {
						color: colorTheme.main.primary,
						fontWeight: 'bold',
						textAlign: 'center',
					},
				},
			})
		}
		setLoading(false)
	}

	async function handleLogOut() {
		setLoading(true)
		await wifiLogoutVITAP()
		setLoading(false)
	}

	useEffect(() => {
		async function getSavedCreds() {
			const wifiCredsStr = await AsyncStorage.getItem('wifi-creds')
			if (!wifiCredsStr) return
			const wifiCreds = JSON.parse(wifiCredsStr)
			setUserName(wifiCreds.username)
			setPwd(wifiCreds.pwd)
		}

		getSavedCreds()
	}, [])

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			marginTop: '10%',
			width: '90%',
			alignSelf: 'center',
			// justifyContent: 'center',
			flexDirection: 'column',
			alignContent: 'center',
		},
		form: {
			width: '100%',
			// height: 425,
			backgroundColor: colorTheme.main.primary,
			// borderColor: colorTheme.accent.secondary,
			// borderWidth: 1,
			marginTop: 5,
			alignSelf: 'center',
			// justifyContent: 'center',
			flexDirection: 'column',
			alignItems: 'center',
			borderRadius: 10,
			// overflow: 'hidden',
		},
		box: {
			padding: 5,
			marginTop: 0,
			gap: 5,
			width: '100%',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'flex-start',
		},
		label: {
			color: colorTheme.accent.primary,
			fontSize: 14,
			fontWeight: 400,
			// width: '50%',
		},
		inputBox: {
			width: '100%',
			height: 50,
			flexDirection: 'row',
			justifyContent: 'space-between',
			borderRadius: 6,

			backgroundColor: colorTheme.main.secondary,
			// gap: 5,
		},
		iconBox: {
			width: '11%',
			borderColor: colorTheme.accent.primary,
			borderWidth: 2,
			borderRightWidth: 0,
			borderRadius: 6,
			borderTopRightRadius: 0,
			borderBottomRightRadius: 0,
			textAlign: 'center',
			justifyContent: 'center',
			alignContent: 'center',
		},
		icon: {
			color: colorTheme.accent.primary,
			fontSize: 20,
			textAlign: 'center',
		},

		input: {
			backgroundColor: colorTheme.main.text,
			color: colorTheme.main.primary,
			fontSize: 15,
			fontWeight: 600,
			marginTop: 0,
			height: '99%',
			width: '89%',
			paddingHorizontal: 10,
			borderRadius: 6,
			borderColor: colorTheme.accent.primary,
			borderWidth: 2,
			borderLeftWidth: 4,
			borderTopLeftRadius: 0,
			borderBottomLeftRadius: 0,
			overflow: 'hidden',
			alignSelf: 'center',
		},
		login: {
			color: colorTheme.main.text,
			fontSize: 20,
			fontWeight: 800,
			// marginBottom: 10,
		},
		captchaImage: {
			marginTop: 8,
			borderRadius: 8,
			overflow: 'hidden',
			width: 240,
			height: 60,
		},
		btn: {
			// marginTop: 20,
			height: 50,
			backgroundColor: colorTheme.accent.primary,
			width: '85%',
			alignItems: 'center',
		},
		btnText: {
			color: colorTheme.main.primary,
			fontWeight: 800,
			fontSize: 18,
			textAlign: 'center',
			alignSelf: 'center',
			justifyContent: 'center',
			// height: '100%',
		},
		btnsBox: {
			flexDirection: 'row',
			gap: 30,
		},
		btnWrapper: {
			width: 150,
			marginTop: 20,
			height: 50,
			justifyContent: 'center',
			alignContent: 'center',
			textAlign: 'center',
			borderRadius: 8,
			elevation: 20, // Android shadow
			// backgroundColor: colorTheme.accent.secondary,
			shadowColor: colorTheme.accent.primary,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.8,
			shadowRadius: 4,
		},
	})

	return loading ? (
		<Loading />
	) : (
		<View style={styles.container}>
			<Text style={styles.login}>WiFi login (VIT-AP portal):</Text>
			<View style={styles.form}>
				<View style={styles.box}>
					<Text style={styles.label}>Username:</Text>
					<View style={styles.inputBox}>
						<View style={[styles.iconBox]}>
							<FontAwesome name="user" style={[styles.icon]} />
						</View>
						<TextInput
							placeholder="User Name"
							style={styles.input}
							onChangeText={onChangeUserName}
							value={userName}
						/>
					</View>
				</View>
				<View style={styles.box}>
					<Text style={styles.label}>Password:</Text>
					<View style={styles.inputBox}>
						<View style={[styles.iconBox]}>
							<Entypo name="lock-open" style={[styles.icon]} />
						</View>
						<TextInput
							placeholder="Password"
							style={styles.input}
							secureTextEntry={true}
							onChangeText={onChangePassword}
							value={pwd}
						/>
					</View>
				</View>

				<View style={styles.btnsBox}>
					<View style={[styles.btnWrapper, { elevation: 0, shadowOpacity: 0 }]}>
						<Pressable
							onPress={handleLogOut}
							android_ripple={{
								color: colorTheme.accent.primary,
								borderless: true,
							}}
							style={({ pressed }) => ({
								backgroundColor: colorTheme.main.tertiary,
								borderRadius: 8,
								opacity: pressed ? 0.5 : 1,
								width: '100%',
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
							})}
						>
							<Text style={[styles.btnText, { color: colorTheme.main.text }]}>Logout</Text>
						</Pressable>
					</View>
					<View style={styles.btnWrapper}>
						<Pressable
							onPress={handleLogin}
							android_ripple={{
								color: colorTheme.accent.primary,
								borderless: true,
							}}
							style={({ pressed }) => ({
								backgroundColor: colorTheme.accent.secondary,
								borderRadius: 8,
								opacity: pressed ? 0.5 : 1,
								width: '100%',
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
							})}
						>
							<Text style={styles.btnText}>Login</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</View>
	)
}
