import React, { useState, useCallback, useContext, useMemo } from 'react'
import { ScrollView, RefreshControl, Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native'
import ClassItem from './ClassItem'

export default function TimeTableDisplay({ route }) {
	const { colorTheme } = useContext(ColorThemeContext)
	let { data, day } = route.params

	if (!data || data.length === 0 || data[0].classes.length === 0) {
		return <Text style={{ color: 'white' }}>No classes for this day!</Text>
	}

	const sortedClasses = useMemo(() => {
		// Only sort once when component mounts or data changes
		return sortClasses(data[0])
	}, [data])

	const [refreshing, setRefreshing] = useState(false)

	// Pull-to-refresh handler
	const onRefresh = useCallback(() => {
		setRefreshing(true)

		//TODO: handle refresh

		// Simulate an async data refresh
		setTimeout(() => {
			setRefreshing(false)
			console.log('Data refreshed!')
		}, 2000)
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
	})

	return (
		<FlatList
			style={{ backgroundColor: colorTheme.main.primary }}
			contentContainerStyle={styles.list}
			data={sortedClasses}
			keyExtractor={(item) => item.class}
			renderItem={({ item }) => <ClassItem item={item} day={day} />}
			refreshing={refreshing}
			onRefresh={onRefresh}
		/>
	)
}

function sortClasses(data) {
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
