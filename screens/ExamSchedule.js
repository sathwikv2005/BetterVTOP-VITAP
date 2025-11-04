import { useCallback, useContext, useEffect, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	RefreshControl,
	Dimensions,
	ToastAndroid,
	Alert,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { ColorThemeContext } from '../context/ColorThemeContext'
import Loading from '../components/Loading'
import { getExamSchedule } from '../util/VTOP/examSchedule'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ForceUpdateContext } from '../context/ForceUpdateContext'
import SemDropDown from '../components/SemDropDown'
import FontAwesome from '@expo/vector-icons/FontAwesome'

const { width } = Dimensions.get('window')

export default function ExamSchedule() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [examSchedule, setExamSchedule] = useState(null)
	const [loading, setLoading] = useState(true)
	const [semData, setSemData] = useState(null)
	const [sem, setSem] = useState(null)
	const { trigger } = useContext(ForceUpdateContext)
	const [refreshing, setRefreshing] = useState(false)

	useEffect(() => {
		async function getSemData() {
			setLoading(true)
			const [[, semStr], [, semDataStr]] = await AsyncStorage.multiGet(['sem', 'semData'])
			if (!semDataStr || !semStr) {
				setLoading(false)
				return goToDrawerTab('login')
			}
			const savedSemData = JSON.parse(semDataStr)
			setSemData(savedSemData.semData)
			setLoading(false)
		}
		getSemData()
	}, [trigger])

	const onRefresh = useCallback(async () => {
		if (!sem) {
			ToastAndroid.show('Please select a semester first', ToastAndroid.SHORT)
			setRefreshing(false)
			return
		}

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		setRefreshing(true)

		const data = await getExamSchedule(setRefreshing, sem)
		if (data.error) {
			console.log(data.error)
			Alert.alert('Error', 'Failed to refresh data. Please try again.')
		} else {
			setExamSchedule(data.examScheduleData)
			ToastAndroid.show('Data refreshed', ToastAndroid.SHORT)
		}
		setRefreshing(false)
	}, [sem])

	async function handleSemChange(prevSem, newSem) {
		setSem(newSem)
		setLoading(true)
		const examStr = await AsyncStorage.getItem(`examSchedule-${newSem}`)

		if (!examStr) {
			const data = await getExamSchedule(setLoading, newSem)
			if (data.error) {
				Alert.alert(
					'Failed to get exam schedule!',
					'Failed to get data from VTOP, please try again later.'
				)
			} else {
				setExamSchedule(data.examScheduleData)
			}
			setLoading(false)
			return
		}
		const examData = JSON.parse(examStr).examScheduleData
		setExamSchedule(examData)
		setLoading(false)
	}

	const styles = StyleSheet.create({
		text: {
			color: colorTheme.main.text,
		},
		emptyTitle: {
			color: colorTheme.main.text,
			fontSize: 18,
			fontWeight: '600',
			textAlign: 'center',
			marginBottom: 6,
		},
		emptySub: {
			color: colorTheme.main.tertiary,
			fontSize: 15,
			textAlign: 'center',
		},
	})

	return loading ? (
		<Loading />
	) : (
		<View style={[{ flex: 1, marginTop: 20 }]}>
			<SemDropDown semData={semData} defaultSem={sem} handleSemChange={handleSemChange} />
			<ExamScheduleTable
				schedule={examSchedule}
				colorTheme={colorTheme}
				refreshing={refreshing}
				onRefresh={onRefresh}
				ListEmptyComponent={
					<View
						style={{
							flex: 1,
							alignItems: 'center',
							paddingHorizontal: 20,
							marginTop: 50,
						}}
					>
						<FontAwesome
							name="info-circle"
							size={40}
							color={colorTheme.accent.primary}
							style={{ marginBottom: 10 }}
						/>
						<Text style={[styles.emptyTitle]}>No Data Available</Text>
						<Text style={[styles.emptySub]}>
							{sem
								? 'Pull down to refresh the schedule.'
								: 'Please select a semester to view schedule.'}
						</Text>
					</View>
				}
			/>
		</View>
	)
}

function ExamScheduleTable({ schedule, colorTheme, refreshing, onRefresh, ListEmptyComponent }) {
	const COLUMNS = [
		{ key: 'courseCode', label: 'Course Code' },
		{ key: 'dateTime', label: 'Date & Time' },
		{ key: 'venue', label: 'Venue' },
		{ key: 'seatLocation', label: 'Seat Location' },
		{ key: 'seatNo', label: 'Seat No.' },
		{ key: 'courseTitle', label: 'Course Title' },
		{ key: 'slot', label: 'Slot' },
	]

	const styles = StyleSheet.create({
		wrapper: {
			flex: 1,
		},

		contentContainer: {
			flexGrow: 1,
		},
		tableWrapper: {
			marginBottom: 30,
		},
		title: {
			fontSize: 18,
			fontWeight: 'bold',
			color: colorTheme.accent.primary,
			marginBottom: 10,
			textAlign: 'center',
		},
		table: {
			borderWidth: 1,
			borderColor: colorTheme.accent.primary,
			borderRadius: 5,
		},
		row: {
			flexDirection: 'row',
		},
		cell: {
			width: 95,
			paddingVertical: 10,
			paddingHorizontal: 5,
			borderWidth: 1,
			borderColor: colorTheme.accent.tertiary,
			textAlign: 'center',
			color: colorTheme.main.text,
			fontSize: 12,
		},
		headerCell: {
			backgroundColor: colorTheme.main.secondary,
			color: colorTheme.accent.primary,
			fontWeight: 'bold',
		},
	})

	return (
		<ScrollView
			style={styles.wrapper}
			contentContainerStyle={styles.contentContainer}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
		>
			{schedule && schedule.length > 0
				? schedule.map(({ type, data }, idx) => (
						<View key={idx} style={styles.tableWrapper}>
							<Text style={styles.title}>{type}</Text>

							<ScrollView
								horizontal
								contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
							>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<View style={styles.table}>
										{/* Header Row */}
										<View style={styles.row}>
											{COLUMNS.map((col) => (
												<Text key={col.key} style={[styles.cell, styles.headerCell]}>
													{col.label}
												</Text>
											))}
										</View>

										{/* Data Rows */}
										{data.map((entry, rowIdx) => (
											<View key={rowIdx} style={styles.row}>
												{COLUMNS.map((col) => {
													let value = entry[col.key] || '-'
													if (col.key === 'dateTime') {
														const date = entry.examDate || '-'
														const time = entry.examTime || '-'
														value = `${date}\n${time}`
													}
													return (
														<Text key={col.key} style={styles.cell}>
															{value}
														</Text>
													)
												})}
											</View>
										))}
									</View>
								</View>
							</ScrollView>
						</View>
				  ))
				: ListEmptyComponent}
		</ScrollView>
	)
}
