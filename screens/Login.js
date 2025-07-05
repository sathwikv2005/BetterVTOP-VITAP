import { useContext, useEffect, useState } from 'react'
import { ColorThemeContext } from '../context/ColorThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, Text, ToastAndroid } from 'react-native'
import { StyleSheet } from 'react-native'
import { TextInput } from 'react-native'
import { Pressable } from 'react-native'
import { vtopLogin } from '../util/VTOP/login'
import { Alert } from 'react-native'
import { fetchVtopData } from '../util/VTOP/getAllData'
import { ForceUpdateContext } from '../context/ForceUpdateContext'
import Loading from '../components/Loading'
import { goToDrawerTab } from '../util/goToDrawerTab'

import FontAwesome from '@expo/vector-icons/FontAwesome'
import Entypo from '@expo/vector-icons/Entypo'

export default function Login() {
	const { colorTheme } = useContext(ColorThemeContext)
	const { trigger, forceUpdate } = useContext(ForceUpdateContext)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)
	const [userName, setUserName] = useState('')
	const [password, setPassword] = useState('')

	useEffect(() => {
		async function getSavedCred() {
			const [[, savedUsername], [, savedPassword]] = await AsyncStorage.multiGet([
				'username',
				'password',
			])
			setUserName(savedUsername)
			setPassword(savedPassword)
		}
		getSavedCred()
	}, [])

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
		const vtopData = await fetchVtopData(setLoading)
		forceUpdate()
		console.log(trigger)
		setLoading(false)
		ToastAndroid.show('Data fetched successfully! ✅', ToastAndroid.LONG)
		return goToDrawerTab('home')
	}

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
			borderWidth: 1,
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
		btnWrapper: {
			width: '85%',
			marginTop: 20,
			height: 50,
			justifyContent: 'center',
			alignContent: 'center',
			textAlign: 'center',
			borderRadius: 8,
			elevation: 20, // Android shadow
			backgroundColor: colorTheme.accent.secondary,
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
			<Text style={styles.login}>Login to VTOP:</Text>
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
							value={password}
						/>
					</View>
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
						<Text style={styles.btnText}>Get VTOP data</Text>
					</Pressable>
				</View>
			</View>
		</View>
	)
}
