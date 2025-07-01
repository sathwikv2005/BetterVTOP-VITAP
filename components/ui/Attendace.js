import { useCallback, useContext, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { FlatList } from 'react-native'
import { StyleSheet } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TextInput } from 'react-native-gesture-handler'
import AttendanceItem from '../AttendanceItem'
import { Alert } from 'react-native'
import { getAllData } from '../../util/VTOP/getAllData.js'
import { getTime } from '../../util/getTime.js'

export function Attendance() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [refreshing, setRefreshing] = useState(false)
	const [lastUpdated, setLastUpdated] = useState(getTime())
	const [attendance, setAttendance] = useState([])
	const [loading, setLoading] = useState(true)
	const [minPercentage, setMinPercentage] = useState(75)

	useEffect(() => {
		async function getCachedAttendance() {
			setLoading(true)
			let data = await JSON.parse(await AsyncStorage.getItem('attendance'))
			let cachedMinPercentage = parseInt(await AsyncStorage.getItem('minPercent'))
			if (cachedMinPercentage && !isNaN(cachedMinPercentage)) setMinPercentage(cachedMinPercentage)

			if (!data) data = []
			setAttendance(data.attendance)
			setLastUpdated(data.createdAt)
			setLoading(false)
		}
		getCachedAttendance().then(() => setLoading(false))
	}, [])

	const onRefresh = useCallback(async () => {
		setRefreshing(true)

		const data = await getAllData()
		if (data.error) {
			console.log(data.error)
			setRefreshing(false)
			return Alert.alert('Failed to login, please try again.')
		}

		setAttendance(data.attendance.attendance)
		setLastUpdated(data.attendance.createdAt)
		setRefreshing(false)
		Alert.alert('Timetable & Attendance refreshed!')
	}, [])

	const styles = StyleSheet.create({
		list: {
			marginTop: '1%',
			width: '100%',
			paddingBottom: '15%',
			flexDirection: 'column',
			alignContent: 'center',
			alignSelf: 'center',
		},
		emptyText: {
			color: 'white',
			textAlign: 'center',
			marginTop: 50,
			fontSize: 18,
		},
		lastUpdated: {
			color: colorTheme.main.tertiary,
			alignSelf: 'center',
			// top: -25,
		},
		input: {
			backgroundColor: colorTheme.main.primary,
			borderBottomColor: colorTheme.main.text,
			borderBottomWidth: 1,
			color: colorTheme.main.text,
			fontSize: 13,
			fontWeight: 600,
			marginTop: 0,
			height: 40,
			width: 45,
			textAlign: 'center',
			paddingBottom: 0,
			paddingHorizontal: 10,
			borderRadius: 6,
			// overflow: 'hidden',
		},
		mainText: {
			marginTop: 15,
			justifyContent: 'center',
			color: colorTheme.main.text,
		},
		minPercent: {
			flexDirection: 'row',
			padding: 10,
			gap: 5,
			// justifyContent: 'space-around',
		},
	})

	async function onChangeMinPercent(newMinPercent) {
		setMinPercentage(newMinPercent)
		await AsyncStorage.setItem('minPercent', newMinPercent)
	}

	return loading ? (
		<Text
			style={{ color: colorTheme.main.text, fontSize: 20, textAlign: 'center', marginTop: '50%' }}
		>
			Loading...
		</Text>
	) : (
		<View>
			<View style={[styles.minPercent]}>
				<Text style={[styles.mainText]}>Minimum Percentage:</Text>
				<TextInput
					value={minPercentage.toString()}
					style={styles.input}
					onChangeText={onChangeMinPercent}
				/>
			</View>
			<FlatList
				style={{ backgroundColor: colorTheme.main.primary }}
				contentContainerStyle={styles.list}
				data={attendance}
				keyExtractor={(item) => item.classDetails}
				renderItem={({ item }) => <AttendanceItem data={item} minPercent={minPercentage} />}
				refreshing={refreshing}
				onRefresh={onRefresh}
				ListEmptyComponent={
					<Text style={styles.emptyText}>No data available. Please try refreshing.</Text>
				}
				ListFooterComponent={
					<View style={{ marginVertical: 20, marginBottom: 50, alignItems: 'center' }}>
						<Text style={styles.lastUpdated}>Last updated on {lastUpdated}</Text>
					</View>
				}
				ListFooterComponentStyle={{ flexGrow: 1 }}
			/>
		</View>
	)
}
