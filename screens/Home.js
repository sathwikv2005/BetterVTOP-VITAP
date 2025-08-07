import { useContext, useEffect, useState } from 'react'
import { Alert, Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation, useNavigationState } from '@react-navigation/native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { Attendance } from '../components/ui/Attendace'
import { Timetable } from '../components/ui/TimeTable'
import Wifi from '../components/ui/Wifi'
import { ForceUpdateContext } from '../context/ForceUpdateContext'
import { getGitHubRelease, downloadAndInstallAPK } from '../util/getGitHubRelease'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { goToDrawerTab } from '../util/goToDrawerTab'
import { useAlert } from 'custom-react-native-alert'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent } from '@react-native-firebase/analytics'

const app = getApp()
const analytics = getAnalytics(app)

const Tab = createBottomTabNavigator()

export function Home() {
	const { showAlert } = useAlert()
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
		let title = tabRouteName.charAt(0).toUpperCase() + tabRouteName.slice(1)
		navigation.setOptions({ headerTitle: title })

		if (updateChecked) return
		setUpdateChecked(true)

		const checkForUpdate = async () => {
			try {
				const latest = await getGitHubRelease()
				if (!latest) return

				const { latestVer, downloadUrl, body } = latest

				showAlert({
					title: '🚀 Update Available',
					message: `Version ${latestVer} is available. Would you like to update now?\n\n${body}`,
					buttons: [
						{
							text: 'Later',
							onPress: () => setProgress(null),
							style: {
								backgroundColor: colorTheme.main.tertiary,
							},
							textStyle: {
								color: colorTheme.main.text,
							},
						},
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
							style: {
								backgroundColor: colorTheme.accent.primary,
							},
							textStyle: {
								color: colorTheme.main.primary,
								fontWeight: 'bold',
							},
						},
					],
					styles: {
						overlay: {
							backgroundColor: '#000000B0',
						},
						container: {
							backgroundColor: colorTheme.main.secondary,
							width: '95%',
							padding: 16,
							borderRadius: 12,
							borderColor: colorTheme.main.primary,
						},
						title: {
							color: colorTheme.accent.primary,
							fontSize: 18,
							fontWeight: '600',
							marginBottom: 4,
							textAlign: 'center',
						},
						message: {
							marginTop: 10,
							color: colorTheme.main.text,
							fontSize: 14,
							marginBottom: 12,
						},
						buttons: {
							justifyContent: 'flex-end',
							flexDirection: 'row',
							flexWrap: 'wrap',
						},
					},
				})
			} catch (err) {
				console.error('Update check failed:', err)
			}
		}

		const logTabScreen = async () => {
			if (
				tabRouteName.toLocaleLowerCase() === 'theory' ||
				tabRouteName.toLocaleLowerCase() === 'lab'
			)
				return

			await logEvent(analytics, 'screen_view', {
				screen_name: tabRouteName,
				screen_class: tabRouteName === 'attendance' ? tabRouteName : 'timetable',
			})
		}
		logTabScreen()

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
				initialRouteName="timetable"
				screenOptions={{
					headerShown: false,
					// tabBarActiveBackgroundColor: colorTheme.accent.tertiary,
					tabBarActiveBackgroundColor: colorTheme.main.secondary,
					tabBarInactiveBackgroundColor: colorTheme.main.secondary,
					tabBarShowLabel: false,
					tabBarIconStyle: { height: '100%' },
					tabBarItemStyle: { borderRadius: 60 },
					tabBarStyle: { borderWidth: 0, borderColor: colorTheme.main.primary },
				}}
			>
				<Tab.Screen
					name="WiFi"
					component={Wifi}
					options={{
						tabBarIcon: ({ focused }) => (
							<FontAwesome5
								name="wifi"
								size={18}
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
