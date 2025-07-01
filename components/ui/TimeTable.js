import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useContext, useEffect, useState } from 'react'
import { Text } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'
// import { timetable } from '../../sample/timetable'
import TimeTableDisplay from '../TimeTableDisplay'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getTime } from '../../util/getTime'

const Tab = createMaterialTopTabNavigator()

export function Timetable() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [timetable, setTimetable] = useState([])
	const [lastUpdated, setLastUpdated] = useState([])
	const [loading, setLoading] = useState(true)
	const weekdayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

	useEffect(() => {
		async function getCachedTimetable() {
			setLoading(true)
			let data = await JSON.parse(await AsyncStorage.getItem('timetable'))

			if (!data)
				data = {
					timetable: [],
					createdAt: getTime(),
				}
			setTimetable(data.timetable)
			setLastUpdated(data.createdAt)
			setLoading(false)
		}
		getCachedTimetable().then(() => setLoading(false))
	}, [lastUpdated])

	var todayIndex = new Date().getDay()
	if (todayIndex === 0) todayIndex = 1

	if (!timetable || timetable === undefined) setTimetable([])
	if (timetable && timetable?.length !== 6 && todayIndex < 2) todayIndex = 2

	const initialRouteName = weekdayMap[todayIndex]

	return loading ? (
		<Text style={{ color: colorTheme.main.text, fontSize: 20 }}>Loading...</Text>
	) : (
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
					initialParams={{
						setTimetable,
						setLastUpdated,
						lastUpdated,
						data: timetable.filter((item) => item.day === 'MON'),
						day: 'MON',
					}}
				/>
			)}

			<Tab.Screen
				name="TUE"
				component={TimeTableDisplay}
				initialParams={{
					setTimetable,
					setLastUpdated,
					lastUpdated,
					data: timetable.filter((item) => item.day === 'TUE'),
					day: 'TUE',
				}}
			/>
			<Tab.Screen
				name="WED"
				component={TimeTableDisplay}
				initialParams={{
					setTimetable,
					setLastUpdated,
					lastUpdated,
					data: timetable.filter((item) => item.day === 'WED'),
					day: 'WED',
				}}
			/>
			<Tab.Screen
				name="THU"
				component={TimeTableDisplay}
				initialParams={{
					setTimetable,
					setLastUpdated,
					lastUpdated,
					data: timetable.filter((item) => item.day === 'THU'),
					day: 'THU',
				}}
			/>
			<Tab.Screen
				name="FRI"
				component={TimeTableDisplay}
				initialParams={{
					setTimetable,
					setLastUpdated,
					lastUpdated,
					data: timetable.filter((item) => item.day === 'FRI'),
					day: 'FRI',
				}}
			/>
			<Tab.Screen
				name="SAT"
				component={TimeTableDisplay}
				initialParams={{
					setTimetable,
					setLastUpdated,
					lastUpdated,
					data: timetable.filter((item) => item.day === 'SAT'),
					day: 'SAT',
				}}
			/>
		</Tab.Navigator>
	)
}
