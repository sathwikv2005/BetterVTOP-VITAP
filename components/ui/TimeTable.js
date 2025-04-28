import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useContext } from 'react'
import { Text } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import { timetable } from '../../sample/timetable'
import TimeTableDisplay from '../TimeTableDisplay'

const Tab = createMaterialTopTabNavigator()

function Test() {
	return <Text>Test</Text>
}

export function Timetable() {
	const { colorTheme } = useContext(ColorThemeContext)

	const weekdayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

	var todayIndex = new Date().getDay()
	if (todayIndex === 0) todayIndex = 1
	if (timetable.length !== 6 && todayIndex < 2) todayIndex = 2

	const initialRouteName = weekdayMap[todayIndex]

	return (
		<>
			<Tab.Navigator
				initialRouteName={initialRouteName}
				screenOptions={{
					tabBarStyle: {
						backgroundColor: colorTheme.main.secondary,
						elevation: 8, // Android shadow depth
						shadowColor: colorTheme.accent.secondary, // Android & iOS shadow color
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
				{timetable.length === 6 && (
					<Tab.Screen
						name="MON"
						component={TimeTableDisplay}
						initialParams={{ data: timetable.filter((item) => item.day === 'MON') }}
					/>
				)}

				<Tab.Screen
					name="TUE"
					component={TimeTableDisplay}
					initialParams={{ data: timetable.filter((item) => item.day === 'TUE') }}
				/>
				<Tab.Screen
					name="WED"
					component={TimeTableDisplay}
					initialParams={{ data: timetable.filter((item) => item.day === 'WED') }}
				/>
				<Tab.Screen
					name="THU"
					component={TimeTableDisplay}
					initialParams={{ data: timetable.filter((item) => item.day === 'THU') }}
				/>
				<Tab.Screen
					name="FRI"
					component={TimeTableDisplay}
					initialParams={{ data: timetable.filter((item) => item.day === 'FRI') }}
				/>
				<Tab.Screen
					name="SAT"
					component={TimeTableDisplay}
					initialParams={{ data: timetable.filter((item) => item.day === 'SAT') }}
				/>
			</Tab.Navigator>
		</>
	)
}
