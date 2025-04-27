import React, { useLayoutEffect, useState } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { Text, View, ActivityIndicator } from 'react-native'
import { Timetable } from './screens/Timetable'
import getColorTheme from './constants/colorTheme/colorThemeMap'
import Feather from '@expo/vector-icons/Feather'
import Foundation from '@expo/vector-icons/Foundation'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { StatusBar } from 'expo-status-bar'

const Drawer = createDrawerNavigator()

function AttendanceScreen() {
	return <Text>Hello</Text>
}

export default function App() {
	const [colorTheme, setColorTheme] = useState(null)

	useLayoutEffect(() => {
		async function callGetColorTheme() {
			const theme = await getColorTheme()
			setColorTheme(theme)
		}
		callGetColorTheme()
	}, [])

	if (!colorTheme) {
		// return a loading spinner
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
			border: colorTheme.accent.secondary,
			notification: colorTheme.accent.tertiary,
		},
	}

	return (
		<NavigationContainer theme={MyTheme}>
			<StatusBar style="light" />
			<Drawer.Navigator
				screenOptions={{
					drawerActiveBackgroundColor: colorTheme.accent.secondary,
					drawerStyle: {
						backgroundColor: colorTheme.main.secondary,
						color: colorTheme.main.text,
					},
					drawerLabelStyle: {
						color: colorTheme.main.text,
					},
				}}
			>
				<Drawer.Screen
					name="timetable"
					component={Timetable}
					options={{
						drawerLabel: ({ focused, color }) => (
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<MaterialCommunityIcons name="timetable" size={22} color={colorTheme.main.text} />
								<Text
									style={{
										marginLeft: 10,
										color: focused ? colorTheme.main.primary : colorTheme.main.text,
										fontWeight: focused ? 800 : 500,
										fontSize: 16,
									}}
								>
									Time Table
								</Text>
							</View>
						),
					}}
				/>
				<Drawer.Screen
					name="attendance"
					component={AttendanceScreen}
					options={{
						drawerLabel: ({ focused, color }) => (
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Foundation name="target" size={22} color={colorTheme.main.text} />
								<Text
									style={{
										marginLeft: 10,
										color: focused ? colorTheme.main.primary : colorTheme.main.text,
										fontWeight: focused ? 800 : 500,
										fontSize: 16,
									}}
								>
									Attendace
								</Text>
							</View>
						),
					}}
				/>
				<Drawer.Screen
					name="settings"
					component={AttendanceScreen}
					options={{
						drawerLabel: ({ focused, color }) => (
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Feather name="settings" size={22} color={colorTheme.main.text} />
								<Text
									style={{
										marginLeft: 10,
										color: focused ? colorTheme.main.primary : colorTheme.main.text,
										fontWeight: focused ? 800 : 500,
										fontSize: 16,
									}}
								>
									Settings
								</Text>
							</View>
						),
					}}
				/>
			</Drawer.Navigator>
		</NavigationContainer>
	)
}
