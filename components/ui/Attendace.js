import { useCallback, useContext, useEffect, useState } from 'react'
import { useRef } from 'react'
import { Pressable, Text, View, Modal } from 'react-native'
import * as Haptics from 'expo-haptics'
import { FlatList } from 'react-native'
import { StyleSheet } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
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
import { Dimensions } from 'react-native'
import Loading from '../Loading.js'
import { useAlert } from 'custom-react-native-alert'
const { height } = Dimensions.get('window')

const Tab = createMaterialTopTabNavigator()

export function Attendance() {
	const { colorTheme } = useContext(ColorThemeContext)
	const { showAlert } = useAlert()

	const { trigger, forceUpdate } = useContext(ForceUpdateContext)
	const [refreshing, setRefreshing] = useState(false)
	const [lastUpdated, setLastUpdated] = useState(getTime())
	const [attendance, setAttendance] = useState([])
	const [attendanceData, setAttendanceData] = useState([])
	const [userUpdated, setUserUpdated] = useState(null)
	const [savedSem, setSavedSem] = useState(null)
	const [loading, setLoading] = useState(true)
	const [minPercentage, setMinPercentage] = useState(75)
	const [tooltipVisible, setTooltipVisible] = useState(false)
	const [tooltipText, setTooltipText] = useState('')

	const [selectedItem, setSelectedItem] = useState(null)
	const [courseItem, setCourseItem] = useState(null)

	const sheetRef = useRef(null)

	const openSheet = async (item) => {
		const target = attendanceData.find((x) => x.classDetails === item.classDetails)
		const userUpdatedDataStr = await AsyncStorage.getItem(`${item.courseID}-${item.classType}`)
		if (!target || !item) return

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
			// console.log(savedAttendanceData.attendanceData)
			setAttendance(data.attendance)
			setLastUpdated(data.createdAt)
			setLoading(false)
		}
		getCachedAttendance().then(() => setLoading(false))
	}, [lastUpdated, trigger])

	const onRefresh = useCallback(async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		setRefreshing(true)

		const data = await getAllData(setRefreshing)
		if (data.error) {
			console.log(data.error)
			setRefreshing(false)
			return showAlert({
				title: '❌ Login Failed',
				message: 'Failed to login. Please try again.',
				styles: {
					overlay: {
						backgroundColor: '#000000B0',
					},
					container: {
						backgroundColor: colorTheme.main.secondary,
						width: '85%',
						padding: 16,
						borderRadius: 12,
						borderColor: colorTheme.main.primary,
					},
					title: {
						color: '#FF5A5F',
						fontSize: 18,
						fontWeight: '600',
						textAlign: 'center',
						marginBottom: 6,
					},
					message: {
						color: colorTheme.main.text,
						fontSize: 15,
						textAlign: 'center',
						marginBottom: 12,
					},
					okButton: {
						backgroundColor: colorTheme.accent.primary,
						paddingVertical: 10,
						borderRadius: 8,
					},
					okText: {
						color: colorTheme.main.primary,
						fontWeight: 'bold',
						textAlign: 'center',
					},
				},
			})
		}

		setAttendance(data.attendance.attendance)
		setLastUpdated(data.attendance.createdAt)
		setRefreshing(false)
		forceUpdate()
		showAlert({
			title: 'All Set!',
			message: 'Your timetable and attendance are now up to date.',
			styles: {
				overlay: {
					backgroundColor: '#000000B0',
				},
				container: {
					backgroundColor: colorTheme.main.secondary,
					width: '85%',
					padding: 16,
					borderRadius: 12,
					borderColor: colorTheme.main.primary,
				},
				title: {
					color: colorTheme.accent.primary,
					fontSize: 18,
					fontWeight: '600',
					marginBottom: 4,
					textAlign: 'center',
				},
				message: {
					marginTop: 10,
					color: colorTheme.main.text,
					fontSize: 15,
					marginBottom: 12,
				},
				okButton: {
					backgroundColor: colorTheme.accent.primary,
					paddingVertical: 10,
					borderRadius: 8,
				},
				okText: {
					color: colorTheme.main.primary,
					fontWeight: 'bold',
					textAlign: 'center',
				},
			},
		})
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
		<Loading />
	) : (
		<>
			<Tab.Navigator
				screenOptions={({ route }) => ({
					tabBarStyle: {
						backgroundColor: colorTheme.main.secondary,
						elevation: 8, // Android shadow depth
						shadowColor: colorTheme.accent.primary, // Android & iOS shadow color
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
				})}
			>
				<Tab.Screen
					name="Theory"
					children={() => (
						<RenderAttendance
							attendance={attendance.filter((x) => x.classType.includes('T'))}
							attendanceData={attendanceData}
							colorTheme={colorTheme}
							styles={styles}
							minPercentage={minPercentage}
							tooltipVisible={tooltipVisible}
							setTooltipVisible={setTooltipVisible}
							setTooltipText={setTooltipText}
							refreshing={refreshing}
							onRefresh={onRefresh}
							lastUpdated={lastUpdated}
							savedSem={savedSem}
							sheetRef={sheetRef}
							selectedItem={selectedItem}
							courseItem={courseItem}
							userUpdated={userUpdated}
							setUserUpdated={setUserUpdated}
							onChangeMinPercent={onChangeMinPercent}
							openSheet={openSheet}
						/>
					)}
				/>
				<Tab.Screen
					name="Lab"
					children={() => (
						<RenderAttendance
							attendance={attendance.filter((x) => !x.classType.includes('T'))}
							attendanceData={attendanceData}
							colorTheme={colorTheme}
							styles={styles}
							minPercentage={minPercentage}
							tooltipVisible={tooltipVisible}
							setTooltipVisible={setTooltipVisible}
							setTooltipText={setTooltipText}
							refreshing={refreshing}
							onRefresh={onRefresh}
							lastUpdated={lastUpdated}
							savedSem={savedSem}
							sheetRef={sheetRef}
							selectedItem={selectedItem}
							courseItem={courseItem}
							userUpdated={userUpdated}
							setUserUpdated={setUserUpdated}
							onChangeMinPercent={onChangeMinPercent}
							openSheet={openSheet}
						/>
					)}
				/>
			</Tab.Navigator>
			<AttendanceDetails
				ref={sheetRef}
				selectedItem={selectedItem}
				courseItem={courseItem}
				colorTheme={colorTheme}
				minPercent={minPercentage}
				userUpdated={userUpdated && userUpdated.length > 0 ? userUpdated : null}
				setUserUpdated={setUserUpdated}
			/>
			{tooltipVisible && (
				<View
					style={{
						position: 'absolute',
						top: height * 0.4,
						left: '5%',
						width: '90%',
						padding: 10,
						backgroundColor: colorTheme.main.primary,
						borderRadius: 8,
						borderColor: colorTheme.accent.primary,
						borderWidth: 1,
						zIndex: 999,
					}}
				>
					<Text style={{ color: colorTheme.main.text, textAlign: 'center', marginBottom: 10 }}>
						{tooltipText}
					</Text>
					<Pressable
						onPress={() => setTooltipVisible(false)}
						style={{ alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 10 }}
					>
						<Text style={{ color: colorTheme.accent.primary, fontWeight: '500' }}>Close</Text>
					</Pressable>
				</View>
			)}
		</>
	)
}

function RenderAttendance({
	styles,
	colorTheme,
	attendance,
	attendanceData,
	minPercentage,
	tooltipVisible,
	setTooltipText,
	setTooltipVisible,
	refreshing,
	onRefresh,
	lastUpdated,
	savedSem,
	sheetRef,
	selectedItem,
	courseItem,
	userUpdated,
	setUserUpdated,
	onChangeMinPercent,
	openSheet,
	...props
}) {
	return (
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
						<AttendanceItem
							data={item}
							attendanceData={attendanceData.find((x) => x.classDetails === item.classDetails)}
							minPercent={minPercentage}
							setTooltipText={setTooltipText}
							setTooltipVisible={setTooltipVisible}
						/>
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
		</View>
	)
}
