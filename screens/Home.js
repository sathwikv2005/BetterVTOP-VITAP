import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useContext } from 'react'
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native'
import { useEffect } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Feather from '@expo/vector-icons/Feather'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { Attendance } from '../components/ui/Attendace'
import { Timetable } from '../components/ui/TimeTable'

const Tab = createBottomTabNavigator()

export function Home() {
	const { colorTheme } = useContext(ColorThemeContext)
	const navigation = useNavigation()

	const state = useNavigationState((state) => state)
	const tabIndex = state.routes.find((r) => r.name === 'home')?.state?.index || 0
	const tabRouteName =
		state.routes.find((r) => r.name === 'home')?.state?.routeNames?.[tabIndex] || 'Timetable'

	useEffect(() => {
		let title = 'Timetable'
		if (tabRouteName === 'timetable') title = 'Timetable'
		else if (tabRouteName === 'attendance') title = 'Attendance'

		navigation.setOptions({
			headerTitle: title,
		})
	}, [tabRouteName])

	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarActiveBackgroundColor: colorTheme.accent.tertiary,
				tabBarInactiveBackgroundColor: colorTheme.main.secondary,
				tabBarShowLabel: false,
				tabBarIconStyle: {
					height: '100%',
				},
				tabBarItemStyle: {
					borderRadius: 60,
				},
				tabBarStyle: {
					borderWidth: 0,
					borderColor: colorTheme.main.primary,
				},
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
	)
}
