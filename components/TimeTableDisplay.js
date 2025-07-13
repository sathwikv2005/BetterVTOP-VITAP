import React, { useState, useCallback, useContext, useMemo, useEffect } from 'react'
import { ScrollView, RefreshControl, Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native'
import ClassItem from './ClassItem'
import { getTimeTable } from '../util/VTOP/timeTable'
import { getAllData } from '../util/VTOP/getAllData'
import FooterItem from './FooterItem.js'
import { ForceUpdateContext } from '../context/ForceUpdateContext'
import { useAlert } from 'custom-react-native-alert'

export default function TimeTableDisplay({ route }) {
	const { showAlert, hideAlert } = useAlert()
	const { trigger, forceUpdate } = useContext(ForceUpdateContext)
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
		console.log(data)
		setTimetable(data.timetable.timetable)
		setLastUpdated(data.timetable.createdAt)
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
	// console.log(JSON.stringify(data))
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
