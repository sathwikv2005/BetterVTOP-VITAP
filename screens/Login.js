import { useContext, useEffect, useState } from 'react'
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
	const [loading, setLoading] = useState(true)
	const [userName, setUserName] = useState('')
	const [password, setPassword] = useState('')
	const [captcha, setCaptcha] = useState('')
	const [captchaUri, setCaptchaUri] = useState(null)

	const [preLogin, setPreLogin] = useState(null)

	useEffect(() => {
		async function getPreLogin() {
			setLoading(true)
			const data = await getCaptcha()
			if (data.error) {
				console.log(data.error)
				return Alert.alert('Login setup failed', 'Failed to login!. Please try again later.')
			}
			setPreLogin(data)
			setCaptchaUri(data.captcha)
			setLoading(false)
		}
		getPreLogin()
	}, [])

	function onChangeUserName(newUserName) {
		setUserName(newUserName)
	}
	function onChangePassword(newPassword) {
		setPassword(newPassword)
	}
	function onChangeCaptcha(newCaptcha) {
		setCaptcha(newCaptcha.toUpperCase())
	}
	async function handleLogin() {
		setLoading(true)
		const data = await vtopLogin(userName, password, captcha, preLogin.csrf, preLogin.jsessionId)
		if (data.error) {
			console.log(data.error)
			return Alert.alert('Login failed', 'Failed to login!. Please try again later.')
		}
		setLoading(false)
		return Alert.alert('Login successful')
	}

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			width: '80%',
			alignSelf: 'center',
			justifyContent: 'center',
			flexDirection: 'column',
			alignContent: 'center',
		},
		form: {
			width: '100%',
			height: 450,
			backgroundColor: colorTheme.main.primary,
			borderColor: colorTheme.accent.secondary,
			borderWidth: 1,
			alignSelf: 'center',
			justifyContent: 'center',
			flexDirection: 'column',
			alignItems: 'center',
			borderRadius: 10,
			marginBottom: '15%',
			overflow: 'hidden',
		},
		box: {
			padding: 8,
			width: '100%',
			justifyContent: 'center',
			alignItems: 'center',
		},
		username: {
			color: colorTheme.main.text,
			fontSize: 18,
			fontWeight: 400,
			width: '90%',
		},
		password: {
			color: colorTheme.main.text,
			fontSize: 18,
			width: '90%',
			fontWeight: 400,
		},
		input: {
			backgroundColor: colorTheme.main.text,
			color: colorTheme.main.primary,
			fontSize: 16,
			fontWeight: 600,
			marginTop: 8,
			height: 40,
			width: '85%',
			paddingHorizontal: 10,
			borderRadius: 6,
			overflow: 'hidden',
		},
		login: {
			color: colorTheme.main.text,
			fontSize: 24,
			fontWeight: 800,
		},
		captchaImage: {
			marginTop: 8,
			borderRadius: 8,
			overflow: 'hidden',
			width: 240,
			height: 60,
		},
		btn: {
			marginTop: 15,
			backgroundColor: colorTheme.accent.secondary,
			borderRadius: 8,
			overflow: 'hidden',
			padding: 8,
			width: 70,
			alignItems: 'center',
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
			<View style={styles.form}>
				<Text style={styles.login}>Login to VTOP</Text>
				<View style={styles.box}>
					<Text style={styles.username}>User Name:</Text>
					<TextInput style={styles.input} onChangeText={onChangeUserName} value={userName} />
				</View>
				<View style={styles.box}>
					<Text style={styles.password}>Password:</Text>
					<TextInput
						style={styles.input}
						secureTextEntry={true}
						onChangeText={onChangePassword}
						value={password}
					/>
				</View>
				<View style={styles.box}>
					<Image style={styles.captchaImage} source={{ uri: captchaUri }} />
					<TextInput
						style={[styles.input, { marginTop: 12 }]}
						keyboardType=""
						onChangeText={onChangeCaptcha}
						value={captcha}
					/>
				</View>
				<View style={styles.btn}>
					<Pressable
						onPress={handleLogin}
						style={({ pressed }) => ({
							opacity: pressed ? 0.5 : 1,
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
