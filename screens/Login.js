import { useContext, useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { View, Text } from 'react-native'
import { StyleSheet } from 'react-native'
import { TextInput } from 'react-native'
import { Image } from 'react-native'
import { Pressable } from 'react-native'
import { getCaptcha, vtopLogin } from '../util/VTOP/login'
import { Alert } from 'react-native'

export default function Login() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)
	const [userName, setUserName] = useState('')
	const [password, setPassword] = useState('')

	// useFocusEffect(
	// 	useCallback(() => {
	// 		let isActive = true

	// 		async function getPreLogin() {
	// 			setLoading(true)
	// 			const data = await getCaptcha()

	// 			if (!isActive) {
	// 				setLoading(false)
	// 				return
	// 			}

	// 			if (data.error) {
	// 				console.log(data.error)
	// 				setCaptcha('')
	// 				setCaptchaUri('')
	// 				setPreLogin(null)
	// 				setLoading(false)
	// 				return Alert.alert(
	// 					'Login setup failed',
	// 					`Failed to login! Please try again later. \n error: ${data.error}`
	// 				)
	// 			}

	// 			setPreLogin(data)
	// 			setCaptchaUri(data.captcha)
	// 			setLoading(false)
	// 		}

	// 		getPreLogin()
	// 		setLoading(false)
	// 		// Optional cleanup
	// 		return () => {
	// 			isActive = false
	// 		}
	// 	}, []) // Will re-run on focus and when `error` changes
	// )

	function onChangeUserName(newUserName) {
		setUserName(newUserName)
	}
	function onChangePassword(newPassword) {
		setPassword(newPassword)
	}

	async function handleLogin() {
		setLoading(true)
		setError(false)
		const data = await vtopLogin(userName, password)
		if (data.error) {
			console.log(data.error)
			setLoading(false)
			setError(true)
			return Alert.alert(
				'Login setup failed',
				`Failed to login! Please try again later. \n error: ${data.error}`
			)
		}
		setLoading(false)
		return Alert.alert('Login successful')
	}

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			width: '90%',
			alignSelf: 'center',
			justifyContent: 'center',
			flexDirection: 'column',
			alignContent: 'center',
		},
		form: {
			width: '100%',
			height: 425,
			backgroundColor: colorTheme.main.primary,
			// borderColor: colorTheme.accent.secondary,
			borderWidth: 1,
			marginTop: 25,
			alignSelf: 'center',
			// justifyContent: 'center',
			flexDirection: 'column',
			alignItems: 'center',
			borderRadius: 10,
			overflow: 'hidden',
		},
		box: {
			padding: 8,
			marginTop: 5,
			width: '100%',
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
		},
		username: {
			color: colorTheme.main.text,
			fontSize: 18,
			fontWeight: 400,
			// width: '50%',
		},
		password: {
			color: colorTheme.main.text,
			fontSize: 18,
			// width: '50%',
			fontWeight: 400,
		},
		input: {
			backgroundColor: colorTheme.main.text,
			color: colorTheme.main.primary,
			fontSize: 16,
			fontWeight: 600,
			marginTop: 0,
			height: 40,
			width: '65%',
			paddingHorizontal: 10,
			marginLeft: 'auto',
			borderRadius: 6,
			overflow: 'hidden',
			alignSelf: 'flex-end',
		},
		login: {
			color: colorTheme.main.text,
			fontSize: 24,
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
			marginTop: 30,
			backgroundColor: colorTheme.accent.secondary,
			borderRadius: 8,
			overflow: 'hidden',
			padding: 8,
			width: '70%',
			alignItems: 'center',
			elevation: 5,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 4,
		},
		btnText: {
			color: colorTheme.main.primary,
			fontWeight: 800,
			fontSize: 18,
		},
	})

	return loading ? (
		<Text style={{ color: colorTheme.main.text, fontSize: 20 }}>Loading...</Text>
	) : (
		<View style={styles.container}>
			<Text style={styles.login}>Login to VTOP:</Text>
			<View style={styles.form}>
				<View style={styles.box}>
					<Text style={styles.username}>Username:</Text>
					<TextInput
						placeholder="User Name"
						style={styles.input}
						onChangeText={onChangeUserName}
						value={userName}
					/>
				</View>
				<View style={styles.box}>
					<Text style={styles.password}>Password:</Text>
					<TextInput
						placeholder="Password"
						style={styles.input}
						secureTextEntry={true}
						onChangeText={onChangePassword}
						value={password}
					/>
				</View>

				<View style={styles.btn}>
					<Pressable
						onPress={handleLogin}
						style={({ pressed }) => ({
							opacity: pressed ? 0.5 : 1,
							width: '100%',
							alignItems: 'center', // center text horizontally
							justifyContent: 'center', // center text vertically if needed
						})}
						android_ripple={{
							color: colorTheme.accent.primary,
							borderless: false,
						}}
					>
						<Text style={styles.btnText}>Login</Text>
					</Pressable>
				</View>
			</View>
		</View>
	)
}
