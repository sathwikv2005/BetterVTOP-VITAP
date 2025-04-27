import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { Text } from 'react-native'

const Tab = createMaterialTopTabNavigator()

function Test() {
	return <Text>Test</Text>
}

export function Timetable() {
	return (
		<Tab.Navigator
			screenOptions={{
				tabBarStyle: {
					backgroundColor: '#000000',
				},
				tabBarIndicatorStyle: {
					backgroundColor: 'red',
					oppacity: '50%',
				},
				tabBarActiveTintColor: 'red',
				tabBarInactiveTintColor: '#FFFFFF98',
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
