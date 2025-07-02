import React, { useState, useCallback, useContext, useMemo } from 'react'
import { ScrollView, RefreshControl, Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native'
import ClassItem from './ClassItem'
import { getTimeTable } from '../util/VTOP/timeTable'
import { Alert } from 'react-native'
import { getAllData } from '../util/VTOP/getAllData'
import FooterItem from './FooterItem.js'

export default function TimeTableDisplay({ route }) {
	const { colorTheme } = useContext(ColorThemeContext)
	const [refreshing, setRefreshing] = useState(false)

	let { data, day, setTimetable, setLastUpdated, lastUpdated, savedSem } = route.params
	const sortedClasses = useMemo(() => {
		// Only sort once when component mounts or data changes
		if (!data[0] || !data[0].classes) return []
		return sortClasses(data[0])
	}, [data])

	// Pull-to-refresh handler
	const onRefresh = useCallback(async () => {
		setRefreshing(true)

		const data = await getAllData()
		if (data.error) {
			console.log(data.error)
			setRefreshing(false)
			return Alert.alert('Failed to login, please try again.')
		}
		console.log(data)
		setTimetable(data.timetable.timetable)
		setLastUpdated(data.timetable.createdAt)
		setRefreshing(false)
		Alert.alert('Timetable & Attendance refreshed!')
	}, [])

	const styles = StyleSheet.create({
		list: {
			marginTop: '10%',
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
			flexGrow: 1,
		},
	})

	return (
		<View>
			<FlatList
				style={{ backgroundColor: colorTheme.main.primary }}
				contentContainerStyle={styles.list}
				data={sortedClasses}
				keyExtractor={(item) => item.class}
				renderItem={({ item }) => <ClassItem item={item} day={day} />}
				refreshing={refreshing}
				onRefresh={onRefresh}
				ListEmptyComponent={<Text style={styles.emptyText}>No classes for this day!</Text>}
				ListFooterComponent={
					<FooterItem style={styles.lastUpdated} lastUpdated={lastUpdated} savedSem={savedSem} />
				}
				ListFooterComponentStyle={{ flexGrow: 1 }}
			/>
		</View>
	)
}

function sortClasses(data) {
	if (!data || data.classes.length === 0) {
		return []
	}
	const sorted = data.classes.slice().sort((a, b) => a.timings.start.localeCompare(b.timings.start))

	const merged = []
	let i = 0

	while (i < sorted.length) {
		const current = sorted[i]
		const next = sorted[i + 1]

		// Check if we can merge with next
		if (
			next &&
			current.type === 'lab' &&
			next.type === 'lab' &&
			current.courseCode === next.courseCode
		) {
			// Directly create merged object
			current.timings.end = next.timings.end // Update the ending time
			merged.push(current)
			i += 2 // Skip the next one (it's merged)
		} else {
			merged.push(current)
			i++
		}
	}

	return merged
}
