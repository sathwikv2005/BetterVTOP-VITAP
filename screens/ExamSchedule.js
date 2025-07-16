import { useCallback, useContext, useEffect, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	RefreshControl,
	Dimensions,
	ToastAndroid,
} from 'react-native'
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
			const savedSem = JSON.parse(semStr)
			const savedSemData = JSON.parse(semDataStr)
			setSemData(savedSemData.semData)
			setLoading(false)
		}
		getSemData()
	}, [trigger])

	const onRefresh = useCallback(async () => {
		setRefreshing(true)

		const data = await getExamSchedule(setRefreshing, sem)
		if (data.error) {
			console.log(data.error)
			setRefreshing(false)
			return Alert.alert('Failed to login, please try again.')
		}
		setExamSchedule(data.examScheduleData)
		setRefreshing(false)
		ToastAndroid.show('Data refreshed', ToastAndroid.SHORT)
	}, [])

	async function handleSemChange(prevSem, newSem) {
		setSem(newSem)
		setLoading(true)
		const examStr = await AsyncStorage.getItem(`examSchedule-${newSem}`)
		if (!examStr) {
			const data = await getExamSchedule(setLoading, newSem)
			if (data.error) {
				setLoading(false)
				return Alert.alert(
					'Failed to get exam schedule!',
					'Failed to get data from vtop, please try again later.'
				)
			}
			setExamSchedule(data.examScheduleData)
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
			/>
		</View>
	)
}

function ExamScheduleTable({ schedule, colorTheme, refreshing, onRefresh }) {
	const COLUMNS = [
		{ key: 'courseCode', label: 'Course Code' },
		{ key: 'courseTitle', label: 'Course Title' },
		{ key: 'examDate', label: 'Date' },
		{ key: 'examTime', label: 'Exam Time' },
		{ key: 'slot', label: 'Slot' },
		{ key: 'venue', label: 'Venue' },
		{ key: 'seatLocation', label: 'Seat Location' },
		{ key: 'seatNo', label: 'Seat No.' },
	]

	if (!schedule || schedule.length === 0)
		return (
			<View style={{ alignItems: 'center', marginTop: 50, paddingHorizontal: 20 }}>
				<FontAwesome
					name="info-circle"
					size={40}
					color={colorTheme.accent.primary}
					style={{ marginBottom: 10 }}
				/>
				<Text
					style={{
						color: colorTheme.main.text,
						fontSize: 18,
						fontWeight: '600',
						textAlign: 'center',
						marginBottom: 6,
					}}
				>
					No Data Available
				</Text>
				<Text
					style={{
						color: colorTheme.main.tertiary,
						fontSize: 15,
						textAlign: 'center',
					}}
				>
					Please select a semester to view schedule.
				</Text>
			</View>
		)

	const styles = StyleSheet.create({
		wrapper: {
			flex: 1,
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
			minWidth: 700,
		},
		row: {
			flexDirection: 'row',
		},
		cell: {
			width: 120,
			paddingVertical: 10,
			paddingHorizontal: 8,
			borderWidth: 1,
			borderColor: colorTheme.accent.tertiary,
			textAlign: 'center',
			color: colorTheme.main.text,
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
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
		>
			{schedule.map(({ type, data }, idx) => (
				<View key={idx} style={styles.tableWrapper}>
					<Text style={styles.title}>{type}</Text>

					<ScrollView horizontal>
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
									{COLUMNS.map((col) => (
										<Text key={col.key} style={styles.cell}>
											{entry[col.key] || '-'}
										</Text>
									))}
								</View>
							))}
						</View>
					</ScrollView>
				</View>
			))}
		</ScrollView>
	)
}
