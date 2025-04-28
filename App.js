import React, { useContext } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { Text, View, ActivityIndicator } from 'react-native'
import { Home } from './screens/Home'
import Feather from '@expo/vector-icons/Feather'
import Entypo from '@expo/vector-icons/Entypo'
import Ionicons from '@expo/vector-icons/Ionicons'
import { StatusBar } from 'expo-status-bar'
import { ColorThemeProvider, ColorThemeContext } from './context/ColorThemeContext'
import Settings from './screens/Settings'
import Login from './screens/Login'

const Drawer = createDrawerNavigator()

export default function App() {
	// Wrap everything with ColorThemeProvider
	return (
		<ColorThemeProvider>
			<MainApp />
		</ColorThemeProvider>
	)
}

function MainApp() {
	const { colorTheme } = useContext(ColorThemeContext)

	if (!colorTheme) {
		// This will display a loading spinner if the color theme hasn't been loaded yet
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
		<NavigationContainer theme={MyTheme}>
			<StatusBar style="light" />
			<Drawer.Navigator
				id="RootDrawer"
				screenOptions={{
					drawerActiveBackgroundColor: colorTheme.accent.secondary,
					drawerStyle: {
						backgroundColor: colorTheme.main.secondary,
						color: colorTheme.main.text,
					},
					drawerLabelStyle: {
						color: colorTheme.main.text,
					},
					headerTitleStyle: {
						color: colorTheme.accent.secondary,
					},
					headerStyle: {
						backgroundColor: colorTheme.main.secondary, // your header background
						elevation: 8, // Android shadow depth
						shadowColor: colorTheme.accent.secondary, // Android & iOS shadow color
						shadowOffset: { width: 0, height: 4 }, // iOS only
						shadowOpacity: 0.3, // iOS only
						shadowRadius: 5, // iOS only
					},
					headerTintColor: colorTheme.accent.secondary,
				}}
			>
				<Drawer.Screen
					name="home"
					component={Home}
					options={{
						drawerLabel: ({ focused }) => (
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Entypo name="home" size={24} color={colorTheme.main.text} />
								<Text
									style={{
										marginLeft: 10,
										color: focused ? colorTheme.main.primary : colorTheme.main.text,
										fontWeight: focused ? '800' : '500',
										fontSize: 16,
									}}
								>
									Home
								</Text>
							</View>
						),
						headerTitle: 'Home',
					}}
				/>

				<Drawer.Screen
					name="login"
					component={Login}
					options={{
						drawerLabel: ({ focused }) => (
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Ionicons name="person" size={24} color={colorTheme.main.text} />
								<Text
									style={{
										marginLeft: 10,
										color: focused ? colorTheme.main.primary : colorTheme.main.text,
										fontWeight: focused ? '800' : '500',
										fontSize: 16,
									}}
								>
									Login
								</Text>
							</View>
						),
						headerTitle: 'Login',
					}}
				/>

				<Drawer.Screen
					name="settings"
					component={Settings}
					options={{
						drawerLabel: ({ focused }) => (
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Feather name="settings" size={22} color={colorTheme.main.text} />
								<Text
									style={{
										marginLeft: 10,
										color: focused ? colorTheme.main.primary : colorTheme.main.text,
										fontWeight: focused ? '800' : '500',
										fontSize: 16,
									}}
								>
									Settings
								</Text>
							</View>
						),
						headerTitle: 'Settings',
					}}
				/>
			</Drawer.Navigator>
		</NavigationContainer>
	)
}
