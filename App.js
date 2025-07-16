import React, { useContext, useEffect } from 'react'
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
import { Text, View, ActivityIndicator, Pressable, Image } from 'react-native'
import * as Notifications from 'expo-notifications'
import { DrawerItem } from '@react-navigation/drawer'
import { Home } from './screens/Home'
import Feather from '@expo/vector-icons/Feather'
import Entypo from '@expo/vector-icons/Entypo'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { StatusBar } from 'expo-status-bar'
import { ColorThemeProvider, ColorThemeContext } from './context/ColorThemeContext'
import Settings from './screens/Settings'
import Login from './screens/Login'
import { ForceUpdateProvider } from './context/ForceUpdateContext'
import Marks from './screens/Marks'
import ExamSchedule from './screens/ExamSchedule'
import openVTOP from './screens/OpenVTOP'
import {
	requestNotificationPermission,
	scheduleClassReminders,
	startAutoReschedule,
} from './util/upcomingClassNotifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FacultyView from './screens/FacultyView'

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
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ForceUpdateProvider>
				<ColorThemeProvider>
					<AlertProvider>
						<MainApp />
					</AlertProvider>
				</ColorThemeProvider>
			</ForceUpdateProvider>
		</GestureHandlerRootView>
	)
}

function MainApp() {
	const { colorTheme } = useContext(ColorThemeContext)

	useEffect(() => {
		async function setupNotifications() {
			const notiEnabled = await AsyncStorage.getItem('upcomingClassNotiEnabled')
			if (notiEnabled === 'false') return

			const granted = await requestNotificationPermission()
			if (granted) {
				const timetable = await AsyncStorage.getItem('timetable')
				if (timetable) {
					await scheduleClassReminders(JSON.parse(timetable))
					await startAutoReschedule()
				}
			}
		}
		setupNotifications()
	}, [])

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

	return (
		<NavigationContainer ref={navigationRef} theme={MyTheme}>
			<StatusBar style="light" />
			<Drawer.Navigator
				id="RootDrawer"
				drawerContent={(props) => <CustomDrawerContent {...props} />}
				screenOptions={{
					drawerActiveBackgroundColor: colorTheme.accent.secondary,
					drawerStyle: {
						backgroundColor: colorTheme.main.secondary,
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

	const isSettingsFocused = focusedRoute === 'settings'

	return (
		<DrawerContentScrollView
			{...props}
			contentContainerStyle={{ flex: 1, justifyContent: 'space-between', paddingTop: 0 }}
		>
			<View>
				<View
					style={{
						backgroundColor: '#0f1012',
						width: '100%',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 10,
						padding: 0,
					}}
				>
					<Image
						source={require('./assets/banner.png')}
						style={{
							backgroundColor: '#0f1012',
							width: '111%',
							height: 150,
							padding: 0,
						}}
						resizeMode="cover"
					/>
				</View>

				{/* Drawer Items */}
				<DrawerItemList {...props} />
			</View>

			<View
				style={{
					borderTopWidth: 1,
					borderColor: colorTheme.main.tertiary,
					height: 65,
					justifyContent: 'center',
				}}
			>
				<DrawerItem
					label="Settings"
					icon={({ color, size }) => (
						<Feather
							name="settings"
							color={isSettingsFocused ? colorTheme.main.primary : colorTheme.main.text}
							size={size}
						/>
					)}
					onPress={() => props.navigation.navigate('settings')}
					labelStyle={{
						fontWeight: isSettingsFocused ? '800' : '500',
						fontSize: 16,
						color: isSettingsFocused ? colorTheme.main.primary : colorTheme.main.text,
					}}
					style={{
						backgroundColor: isSettingsFocused ? colorTheme.accent.secondary : 'transparent',
					}}
					activeTintColor={colorTheme.main.primary}
					inactiveTintColor={colorTheme.main.text}
				/>
			</View>
		</DrawerContentScrollView>
	)
}
