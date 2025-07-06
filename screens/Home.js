import { useContext, useEffect, useState } from 'react'
import { Alert, Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation, useNavigationState } from '@react-navigation/native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Feather from '@expo/vector-icons/Feather'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { Attendance } from '../components/ui/Attendace'
import { Timetable } from '../components/ui/TimeTable'
import { ForceUpdateContext } from '../context/ForceUpdateContext'
import { getGitHubRelease, downloadAndInstallAPK } from '../util/getGitHubRelease'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { goToDrawerTab } from '../util/goToDrawerTab'

const Tab = createBottomTabNavigator()

export function Home() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [updateChecked, setUpdateChecked] = useState(false)
	const [progress, setProgress] = useState(null)
	const [progressVisible, setProgressVisible] = useState(false)
	const [userName, setUserName] = useState(null)

	const navigation = useNavigation()
	const { trigger } = useContext(ForceUpdateContext)
	const state = useNavigationState((state) => state)
	const tabIndex = state.routes.find((r) => r.name === 'home')?.state?.index || 0
	const tabRouteName =
		state.routes.find((r) => r.name === 'home')?.state?.routeNames?.[tabIndex] || 'Timetable'

	useEffect(() => {
		let title = tabRouteName === 'attendance' ? 'Attendance' : 'Timetable'
		navigation.setOptions({ headerTitle: title })

		if (updateChecked) return
		setUpdateChecked(true)

		const checkForUpdate = async () => {
			try {
				const latest = await getGitHubRelease()
				if (!latest) return

				const { latestVer, downloadUrl } = latest

				Alert.alert(
					'Update Available',
					`Version ${latestVer} is available. Would you like to update now?`,
					[
						{ text: 'Later', style: 'cancel', onPress: () => setProgress(null) },
						{
							text: 'Update Now',
							onPress: () => {
								setProgress(0)
								setProgressVisible(true)
								downloadAndInstallAPK(downloadUrl, latestVer, (p) => {
									setProgress(p)
									if (p === 1) setProgressVisible(false)
								})
							},
						},
					]
				)
			} catch (err) {
				console.error('Update check failed:', err)
			}
		}

		async function checkUserName() {
			const userName = await AsyncStorage.getItem('username')
			if (!userName)
				Alert.alert(
					'Login Required',
					'We couldn’t find your saved VTOP credentials.\n\nPlease log in to fetch your latest data from VTOP.',
					[
						{
							text: 'Remind Me Later',
							style: 'cancel',
						},
						{
							text: 'Log In Now',
							onPress: () => {
								goToDrawerTab('login')
							},
						},
					]
				)
		}
		checkUserName()
		checkForUpdate()
	}, [tabRouteName, trigger])

	const styles = StyleSheet.create({
		modalBackground: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.7)',
			justifyContent: 'center',
			alignItems: 'center',
		},
		modalBox: {
			backgroundColor: colorTheme.main.secondary,
			padding: 20,
			borderColor: colorTheme.accent.primary,
			borderWidth: 1,
			borderRadius: 10,
			width: '70%',
			gap: 15,
			alignItems: 'center',
			elevation: 10,
			shadowColor: colorTheme.accent.primary,
			shadowOffset: { width: -2, height: -4 },
			shadowOpacity: 0.3,
			shadowRadius: 5,
		},
		downloadText: {
			flexDirection: 'row',
			gap: 5,
			justifyContent: 'center',
			alignItems: 'center',
		},
	})

	return (
		<>
			<Tab.Navigator
				screenOptions={{
					headerShown: false,
					tabBarActiveBackgroundColor: colorTheme.accent.tertiary,
					tabBarInactiveBackgroundColor: colorTheme.main.secondary,
					tabBarShowLabel: false,
					tabBarIconStyle: { height: '100%' },
					tabBarItemStyle: { borderRadius: 60 },
					tabBarStyle: { borderWidth: 0, borderColor: colorTheme.main.primary },
				}}
			>
				<Tab.Screen
					name="timetable"
					component={Timetable}
					options={{
						tabBarIcon: ({ focused }) => (
							<MaterialCommunityIcons
								name="timetable"
								size={24}
								color={focused ? colorTheme.accent.primary : colorTheme.main.text}
								style={{
									borderTopWidth: focused ? 2 : 0,
									borderRadius: focused ? 0 : 40,
									borderTopColor: colorTheme.accent.primary,
									paddingTop: 4,
								}}
							/>
						),
					}}
				/>
				<Tab.Screen
					name="attendance"
					component={Attendance}
					options={{
						tabBarIcon: ({ focused }) => (
							<Feather
								name="target"
								size={24}
								color={focused ? colorTheme.accent.primary : colorTheme.main.text}
								style={{
									borderTopWidth: focused ? 2 : 0,
									borderTopColor: colorTheme.accent.primary,
									paddingTop: 4,
								}}
							/>
						),
					}}
				/>
			</Tab.Navigator>

			<Modal
				visible={progressVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setProgressVisible(false)}
			>
				<View style={styles.modalBackground}>
					<View style={styles.modalBox}>
						<View style={[styles.downloadText]}>
							<Text style={{ fontSize: 16, marginBottom: 10, color: colorTheme.main.text }}>
								Downloading update:
							</Text>

							<Text style={{ fontSize: 20, marginBottom: 10, color: colorTheme.accent.primary }}>
								{(progress * 100).toFixed(0)}%
							</Text>
						</View>
						<ActivityIndicator size="large" color={colorTheme.accent.primary} />
					</View>
				</View>
			</Modal>
		</>
	)
}
