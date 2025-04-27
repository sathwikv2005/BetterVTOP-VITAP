import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useContext } from 'react'
import { Text } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'

const Tab = createMaterialTopTabNavigator()

function Test() {
	return <Text>Test</Text>
}

export function Timetable() {
	const { colorTheme } = useContext(ColorThemeContext)

	return (
		<Tab.Navigator
			screenOptions={{
				tabBarStyle: {
					backgroundColor: colorTheme.main.secondary,
					elevation: 8, // Android shadow depth
					shadowColor: colorTheme.main.text, // Android & iOS shadow color
					shadowOffset: { width: 0, height: 4 }, // iOS only
					shadowOpacity: 0.3, // iOS only
					shadowRadius: 5, // iOS only
				},
				tabBarIndicatorStyle: {
					backgroundColor: colorTheme.accent.primary,
					oppacity: '50%',
				},

				tabBarActiveTintColor: colorTheme.accent.primary,
				tabBarInactiveTintColor: colorTheme.main.tertiary,
				tabBarBounces: true,
			}}
		>
			<Tab.Screen name="MON" component={Test} />
			<Tab.Screen name="TUE" component={Test} />
			<Tab.Screen name="WED" component={Test} />
			<Tab.Screen name="THU" component={Test} />
			<Tab.Screen name="FRI" component={Test} />
			<Tab.Screen name="SAT" component={Test} />
		</Tab.Navigator>
	)
}
