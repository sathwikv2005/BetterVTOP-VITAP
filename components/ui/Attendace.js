import { useContext, useEffect, useState } from 'react'
import { Text } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'

export function Attendance() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [attendance, setAttendance] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function getCachedAttendance() {
			setLoading(true)
			let data = await JSON.parse(await AsyncStorage.getItem('attendance'))

			if (!data) data = []
			setAttendance(data)
			setLoading(false)
		}
		getCachedAttendance().then(() => setLoading(false))
	}, [])

	return loading ? (
		<Text style={{ color: colorTheme.main.text, fontSize: 20 }}>Loading...</Text>
	) : (
		<>
			<FlatList
				style={{ backgroundColor: colorTheme.main.primary }}
				contentContainerStyle={styles.list}
				data={sortedClasses}
				keyExtractor={(item) => item.class}
				renderItem={({ item }) => <ClassItem item={item} day={day} />}
				refreshing={refreshing}
				onRefresh={onRefresh}
				ListEmptyComponent={<Text style={styles.emptyText}>No classes for this day!</Text>}
			/>
		</>
	)
}
