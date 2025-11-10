import React, { useContext, useEffect, useRef, useState } from 'react'
import { AlertProvider, useAlert } from 'custom-react-native-alert'
import 'react-native-gesture-handler'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
	createDrawerNavigator,
	DrawerContentScrollView,
	DrawerItemList,
} from '@react-navigation/drawer'
import { navigationRef } from './navigation/RootNavigation'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { Text, View, ActivityIndicator, Pressable, Image, ToastAndroid } from 'react-native'
import * as Notifications from 'expo-notifications'
import { DrawerItem } from '@react-navigation/drawer'
import { Home } from './screens/Home'
import Feather from '@expo/vector-icons/Feather'
import Entypo from '@expo/vector-icons/Entypo'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { StatusBar } from 'expo-status-bar'
import { ColorThemeProvider, ColorThemeContext } from './context/ColorThemeContext'
import Settings from './screens/Settings'
import Login from './screens/Login'
import { ForceUpdateContext, ForceUpdateProvider } from './context/ForceUpdateContext'
import Marks from './screens/Marks'
import ExamSchedule from './screens/ExamSchedule'
import openVTOP from './screens/OpenVTOP'
import {
	requestNotificationPermission,
	scheduleClassReminders,
	startAutoReschedule,
} from './util/upcomingClassNotifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent, setUserProperty } from '@react-native-firebase/analytics'
import Constants from 'expo-constants'
import FacultyView from './screens/FacultyView'
import WhatsNew from './components/whats_new/WhatsNew'
import displayWhatsNew from './constants/displayWhatsNew'
import { getAllData } from './util/VTOP/getAllData'
import Loading from './components/Loading'
import { goToDrawerTab } from './util/goToDrawerTab'
import SpeedTest from './screens/SpeedTest'
import MessMenu from './screens/MessMenu'

const version = Constants.expoConfig.version
const variant = Constants.expoConfig.name?.toLowerCase().includes('dev') ? 'dev' : 'prod'

const app = getApp()
const analytics = getAnalytics(app)

const Drawer = createDrawerNavigator()

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
})

export default function App() {
	const [showWhatsNew, setShowWhatsNew] = useState(false)

	useEffect(() => {
		async function checkFirstOpenAfterUpdate() {
			const checkVersion = await AsyncStorage.getItem('last-seen-version')
			// const checkVersion = true
			setShowWhatsNew(displayWhatsNew && checkVersion !== version)
			// setShowWhatsNew(true)
		}
		checkFirstOpenAfterUpdate()
	}, [])

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ForceUpdateProvider>
				<ColorThemeProvider>
					<AlertProvider>
						<MainApp />
						{showWhatsNew && <WhatsNew setShowWhatsNew={setShowWhatsNew} version={version} />}
					</AlertProvider>
				</ColorThemeProvider>
			</ForceUpdateProvider>
		</GestureHandlerRootView>
	)
}

function MainApp() {
	const { showAlert } = useAlert()
	const { colorTheme } = useContext(ColorThemeContext)
	const [username, setUserName] = useState(null)
	const [loading, setLoading] = useState(false)
	const { trigger, forceUpdate } = useContext(ForceUpdateContext)

	useEffect(() => {
		async function checkUserName() {
			const userName = await AsyncStorage.getItem('username')

			if (!userName) {
				showAlert({
					title: '🔐 Login Required',
					message:
						'We couldn’t find your saved VTOP credentials.\n\nPlease log in to fetch your latest data from VTOP.',
					buttons: [
						{
							text: 'Remind Me Later',
							style: {
								backgroundColor: colorTheme.main.tertiary,
							},
							textStyle: {
								color: colorTheme.main.text,
							},
						},
						{
							text: 'Log In Now',
							onPress: () => goToDrawerTab('login'),
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
							textAlign: 'center',
						},
						buttons: {
							justifyContent: 'flex-end',
							flexDirection: 'row',
							flexWrap: 'wrap',
						},
					},
				})
				setUserName(null)
				return
			}
			setUserName(userName)
		}
		checkUserName()
	}, [])

	useEffect(() => {
		async function runDailyTask() {
			const today = new Date().toISOString().split('T')[0] // "YYYY-MM-DD"
			const lastRun = await AsyncStorage.getItem('last-daily-run')
			if (lastRun !== today) {
				try {
					await getAllData(setLoading)
				} catch (err) {
					setLoading(false)
					console.log(err)
					return ToastAndroid.show(
						'⚠️ Unable to fetch the latest VTOP data.\nPlease check your internet connection and try again.',
						ToastAndroid.LONG
					)
				}
				ToastAndroid.show('✅ Your VTOP data has been updated automatically.', ToastAndroid.LONG)
				await AsyncStorage.setItem('last-daily-run', today)
				forceUpdate()
			}
			setLoading(false)
		}

		if (username) runDailyTask().catch((err) => console.log(err))

		async function setupNotifications() {
			const notiEnabled = await AsyncStorage.getItem('upcomingClassNotiEnabled')
			if (notiEnabled === 'false') return

			const granted = await requestNotificationPermission()
			if (granted) {
				const timetable = await AsyncStorage.getItem('timetable')
				if (timetable) {
					const today = new Date().toISOString().split('T')[0]
					const lastReset = await AsyncStorage.getItem('last-reset-date')
					if (lastReset !== today) {
						await AsyncStorage.removeItem('scheduledClassNotifications')
						await AsyncStorage.setItem('last-reset-date', today)
					}
					setTimeout(async () => {
						await scheduleClassReminders(JSON.parse(timetable))
						await startAutoReschedule()
					}, 1000)
				}
			}
		}
		setupNotifications()
		async function setUserProperties() {
			try {
				await setUserProperty(analytics, 'app_version', version)
				await setUserProperty(analytics, 'app_variant', variant)
			} catch (error) {
				console.error('[Analytics] Failed to set user properties', error)
			}
		}

		setUserProperties()
	}, [username])

	if (!colorTheme) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		)
	}

	const MyTheme = {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			background: colorTheme.main.primary,
			text: colorTheme.main.text,
			primary: colorTheme.accent.primary,
			card: colorTheme.main.primary,
			border: colorTheme.main.text,
			notification: colorTheme.accent.tertiary,
		},
	}

	const routeNameRef = useRef()
	if (loading) return <Loading />
	return (
		<NavigationContainer
			ref={navigationRef}
			theme={MyTheme}
			onReady={async () => {
				const currentRoute = navigationRef.getCurrentRoute()
				if (currentRoute) {
					routeNameRef.current = currentRoute.name
					await logEvent(analytics, 'screen_view', {
						screen_name: currentRoute.name,
						screen_class: currentRoute.name,
					})
				}
			}}
			onStateChange={async () => {
				const prevRouteName = routeNameRef.current
				const currentRoute = navigationRef.getCurrentRoute()

				if (currentRoute && prevRouteName !== currentRoute.name) {
					routeNameRef.current = currentRoute.name
					await logEvent(analytics, 'screen_view', {
						screen_name: currentRoute.name,
						screen_class: currentRoute.name,
					})
				}
			}}
		>
			<StatusBar style="light" />
			<Drawer.Navigator
				id="RootDrawer"
				drawerContent={(props) => <CustomDrawerContent {...props} />}
				screenOptions={{
					drawerActiveBackgroundColor: colorTheme.accent.secondary,
					drawerStyle: {
						backgroundColor: colorTheme.main.secondary,
						// borderRightColor: colorTheme.accent.secondary,
						// borderRightWidth: 7,
						// borderRadius: 0,
					},
					drawerLabelStyle: {
						color: colorTheme.main.text,
					},
					headerTitleStyle: {
						color: colorTheme.accent.secondary,
					},
					headerStyle: {
						backgroundColor: colorTheme.main.secondary,
						elevation: 8,
						shadowColor: colorTheme.accent.secondary,
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.3,
						shadowRadius: 5,
					},
					headerTintColor: colorTheme.accent.secondary,
				}}
			>
				<Drawer.Screen
					name="home"
					component={Home}
					options={{
						drawerLabel: ({ focused }) => (
							<DrawerLabel icon={<Entypo name="home" size={24} />} text="Home" focused={focused} />
						),
						headerTitle: 'Timetable',
					}}
				/>

				<Drawer.Screen
					name="login"
					component={Login}
					options={{
						drawerLabel: ({ focused }) => (
							<DrawerLabel
								icon={<Ionicons name="person" size={24} />}
								text="Login"
								focused={focused}
							/>
						),
						headerTitle: 'Login',
					}}
				/>
				<Drawer.Screen
					name="marks"
					component={Marks}
					options={{
						drawerLabel: ({ focused }) => (
							<DrawerLabel
								icon={<Entypo name="bar-graph" size={24} />}
								text="Marks"
								focused={focused}
							/>
						),
						headerTitle: 'Marks',
					}}
				/>
				<Drawer.Screen
					name="examSchedule"
					component={ExamSchedule}
					options={{
						drawerLabel: ({ focused }) => (
							<DrawerLabel
								icon={<Entypo name="book" size={24} />}
								text="Exam Schedule"
								focused={focused}
							/>
						),
						headerTitle: 'Exam Schedule',
					}}
				/>
				<Drawer.Screen
					name="facultyView"
					component={FacultyView}
					options={{
						drawerLabel: ({ focused }) => (
							<DrawerLabel
								icon={<Entypo name="graduation-cap" size={24} />}
								text="Faculty Info"
								focused={focused}
							/>
						),
						headerTitle: 'Faculty Info',
					}}
				/>
				<Drawer.Screen
					name="messMenu"
					component={MessMenu}
					options={{
						headerTitle: 'Mess Menu',
					}}
				/>
				<Drawer.Screen
					name="openVTOP"
					component={openVTOP}
					options={{
						drawerLabel: ({ focused }) => (
							<DrawerLabel
								icon={<FontAwesome name="globe" size={24} />}
								text="Open VTOP"
								focused={focused}
							/>
						),
						headerTitle: 'VTOP',
					}}
				/>
				<Drawer.Screen
					name="speedtest"
					component={SpeedTest}
					options={{
						drawerLabel: ({ focused }) => (
							<DrawerLabel
								icon={<MaterialIcons name="speed" size={24} />}
								text="Speed test"
								focused={focused}
							/>
						),
						headerTitle: 'Speed Test',
					}}
				/>

				<Drawer.Screen
					name="settings"
					component={Settings}
					options={{ drawerLabel: () => null, title: 'Settings', drawerItemStyle: { height: 0 } }}
				/>
			</Drawer.Navigator>
		</NavigationContainer>
	)
}

function DrawerLabel({ icon, text, focused }) {
	const { colorTheme } = useContext(ColorThemeContext)
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			{React.cloneElement(icon, {
				color: focused ? colorTheme.main.primary : colorTheme.main.text,
			})}
			<Text
				style={{
					marginLeft: 10,
					color: focused ? colorTheme.main.primary : colorTheme.main.text,
					fontWeight: focused ? '800' : '500',
					fontSize: 16,
				}}
			>
				{text}
			</Text>
		</View>
	)
}

function CustomDrawerContent(props) {
	const { colorTheme } = useContext(ColorThemeContext)
	const focusedRoute = props.state.routeNames[props.state.index]

	const Separator = () => (
		<View
			style={{
				height: 1,
				backgroundColor: colorTheme.main.tertiary,
				marginVertical: 6,
			}}
		/>
	)

	// Helper to render a styled drawer item
	const renderDrawerItem = (route, icon, label) => {
		const isFocused = focusedRoute === route
		return (
			<DrawerItem
				label={() => <DrawerLabel icon={icon} text={label} focused={isFocused} />}
				onPress={() => props.navigation.navigate(route)}
				style={{
					backgroundColor: isFocused ? colorTheme.accent.secondary : 'transparent',
				}}
			/>
		)
	}

	return (
		<DrawerContentScrollView
			{...props}
			contentContainerStyle={{ flex: 1, justifyContent: 'space-between', paddingTop: 0 }}
		>
			<View>
				{/* Banner */}
				<View
					style={{
						backgroundColor: '#0f1012',
						width: '100%',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 10,
					}}
				>
					<Image
						source={require('./assets/banner.png')}
						style={{
							backgroundColor: '#0f1012',
							width: '111%',
							height: 150,
						}}
						resizeMode="cover"
					/>
				</View>

				{/* Group 1 */}
				{renderDrawerItem('home', <Entypo name="home" size={24} />, 'Home')}
				{renderDrawerItem('login', <Ionicons name="person" size={24} />, 'Login')}
				{renderDrawerItem('messMenu', <FontAwesome name="building-o" size={24} />, 'Mess Menu')}
				{renderDrawerItem('openVTOP', <FontAwesome name="globe" size={24} />, 'Open VTOP')}

				<Separator />

				{/* Group 2 */}
				{renderDrawerItem('marks', <Entypo name="bar-graph" size={24} />, 'Marks')}
				{renderDrawerItem('examSchedule', <Entypo name="book" size={24} />, 'Exam Schedule')}
				{renderDrawerItem(
					'facultyView',
					<Entypo name="graduation-cap" size={24} />,
					'Faculty Info'
				)}

				<Separator />

				{/* Group 3 */}
				{renderDrawerItem('speedtest', <MaterialIcons name="speed" size={24} />, 'Speed Test')}
			</View>

			{/* Settings at bottom */}
			<View
				style={{
					borderTopWidth: 1,
					borderColor: colorTheme.main.tertiary,
					height: 65,
					justifyContent: 'center',
				}}
			>
				{renderDrawerItem('settings', <Feather name="settings" size={24} />, 'Settings')}
			</View>
		</DrawerContentScrollView>
	)
}
