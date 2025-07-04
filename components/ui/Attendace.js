import { useCallback, useContext, useEffect, useState } from 'react'
import { useRef } from 'react'
import { Pressable, Text, View, Modal } from 'react-native'
import { FlatList } from 'react-native'
import { StyleSheet } from 'react-native'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TextInput } from 'react-native-gesture-handler'
import AttendanceItem from '../AttendanceItem'
import { Alert } from 'react-native'
import { getAllData } from '../../util/VTOP/getAllData.js'
import { getTime } from '../../util/getTime.js'
import FooterItem from '../FooterItem.js'
import { ForceUpdateContext } from '../../context/ForceUpdateContext.js'
import AttendanceDetails from '../AttendanceDetails.js'

export function Attendance() {
	const { colorTheme } = useContext(ColorThemeContext)
	const { trigger } = useContext(ForceUpdateContext)
	const [refreshing, setRefreshing] = useState(false)
	const [lastUpdated, setLastUpdated] = useState(getTime())
	const [attendance, setAttendance] = useState([])
	const [attendanceData, setAttendanceData] = useState([])
	const [userUpdated, setUserUpdated] = useState(null)
	const [savedSem, setSavedSem] = useState(null)
	const [loading, setLoading] = useState(true)
	const [minPercentage, setMinPercentage] = useState(75)

	const [selectedItem, setSelectedItem] = useState(null)
	const [courseItem, setCourseItem] = useState(null)

	const sheetRef = useRef(null)

	const openSheet = async (item) => {
		const target = attendanceData.find((x) => x.classDetails === item.classDetails)
		const userUpdatedDataStr = await AsyncStorage.getItem(`${item.courseID}-${item.classType}`)
		if (!target || !item) return
		console.log(`${item.courseID}-${item.classType} >> `, userUpdatedDataStr)
		const userUpdatedData = JSON.parse(userUpdatedDataStr)
		setUserUpdated(userUpdatedData)
		setSelectedItem(item)
		setCourseItem(target)
		sheetRef.current?.open()
	}

	useEffect(() => {
		async function getCachedAttendance() {
			setLoading(true)
			const [[, attendanceStr], [, attendanceDataStr], [, minPercentStr], [, semStr]] =
				await AsyncStorage.multiGet(['attendance', 'attendanceData', 'minPercent', 'sem'])

			let data = await JSON.parse(attendanceStr)
			let savedAttendanceData = JSON.parse(attendanceDataStr)
			let cachedMinPercentage = parseInt(minPercentStr)
			if (!cachedMinPercentage || isNaN(cachedMinPercentage)) cachedMinPercentage = 75
			let sem = (await JSON.parse(semStr)) || null
			setSavedSem(sem)
			if (!savedAttendanceData) savedAttendanceData = { attendanceData: [], createdAt: getTime() }
			setAttendanceData(savedAttendanceData.attendanceData)

			setMinPercentage(cachedMinPercentage)

			if (!data) data = { attendance: [], createdAt: getTime() }

			setAttendance(data.attendance)
			setLastUpdated(data.createdAt)
			setLoading(false)
		}
		getCachedAttendance().then(() => setLoading(false))
	}, [lastUpdated, trigger])

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
				renderItem={({ item }) => (
					<Pressable onPress={() => openSheet(item)}>
						<AttendanceItem data={item} minPercent={minPercentage} />
					</Pressable>
				)}
				refreshing={refreshing}
				onRefresh={onRefresh}
				ListEmptyComponent={
					<Text style={styles.emptyText}>No data available. Please try refreshing.</Text>
				}
				ListFooterComponent={
					<FooterItem style={styles.lastUpdated} lastUpdated={lastUpdated} savedSem={savedSem} />
				}
				ListFooterComponentStyle={{ flexGrow: 1 }}
			/>
			<AttendanceDetails
				ref={sheetRef}
				selectedItem={selectedItem}
				courseItem={courseItem}
				colorTheme={colorTheme}
				minPercent={minPercentage}
				userUpdated={userUpdated && userUpdated.length > 0 ? userUpdated : null}
				setUserUpdated={setUserUpdated}
			/>
		</View>
	)
}
