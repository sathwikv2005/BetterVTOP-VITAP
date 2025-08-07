import React, { useState, useCallback, useContext, useMemo, useRef } from 'react'
import { Text, View, StyleSheet, FlatList, Pressable } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { getAllData } from '../util/VTOP/getAllData'
import FooterItem from './FooterItem.js'
import { ForceUpdateContext } from '../context/ForceUpdateContext'
import { useAlert } from 'custom-react-native-alert'
import { Modalize } from 'react-native-modalize'
import ClassItem from './ClassItem'

export default function TimeTableDisplay({ route }) {
	const { showAlert } = useAlert()
	const { forceUpdate } = useContext(ForceUpdateContext)
	const { colorTheme } = useContext(ColorThemeContext)
	const [refreshing, setRefreshing] = useState(false)
	const [selectedClass, setSelectedClass] = useState(null)
	const modalRef = useRef(null)

	let { data, day, setTimetable, setLastUpdated, lastUpdated, savedSem } = route.params

	const sortedClasses = useMemo(() => {
		if (!data[0] || !data[0].classes) return []
		return sortClasses(data[0])
	}, [data])

	const onRefresh = useCallback(async () => {
		setRefreshing(true)
		const data = await getAllData(setRefreshing)
		if (data.error) {
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
			alignSelf: 'center',
		},
		emptyText: {
			color: colorTheme.main.text,
			textAlign: 'center',
			marginTop: 50,
			fontSize: 18,
		},
		lastUpdated: {
			color: colorTheme.main.tertiary,
			alignSelf: 'center',
		},
		modalContent: {
			padding: 20,
		},
		modalTitle: {
			fontSize: 22,
			fontWeight: '700',
			color: colorTheme.accent.primary,
			textAlign: 'center',
		},
		courseCode: {
			fontSize: 14,
			color: colorTheme.main.tertiary,
			textAlign: 'center',
			marginBottom: 16,
		},
		card: {
			backgroundColor: colorTheme.main.primary,
			padding: 15,
			borderRadius: 12,
			marginBottom: 12,
			elevation: 3,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 3,
			gap: 5,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginBottom: 8,
		},
		label: {
			fontSize: 13,
			alignContent: 'center',
			fontWeight: '600',
			color: colorTheme.main.text,
			opacity: 0.8,
		},
		value: {
			fontSize: 14,
			fontWeight: '600',
			color: colorTheme.accent.secondary,
		},
	})

	const renderItem = ({ item }) => (
		<Pressable
			onPress={() => {
				setSelectedClass(item)
				modalRef.current?.open()
			}}
		>
			<ClassItem item={item} day={day} />
		</Pressable>
	)

	return (
		<View style={{ flex: 1 }}>
			<FlatList
				style={{ backgroundColor: colorTheme.main.primary }}
				contentContainerStyle={styles.list}
				data={sortedClasses}
				keyExtractor={(item) => item.class}
				renderItem={renderItem}
				refreshing={refreshing}
				onRefresh={onRefresh}
				ListEmptyComponent={<Text style={styles.emptyText}>No classes for this day!</Text>}
				ListFooterComponent={
					<FooterItem style={styles.lastUpdated} lastUpdated={lastUpdated} savedSem={savedSem} />
				}
			/>

			<Modalize
				ref={modalRef}
				adjustToContentHeight
				handleStyle={{ backgroundColor: colorTheme.accent.primary }}
				modalStyle={{
					borderTopColor: colorTheme.accent.secondary,
					// borderTopWidth: 3,
					backgroundColor: colorTheme.main.secondary,
					borderTopLeftRadius: 16,
					borderTopRightRadius: 16,
					paddingBottom: 20,
				}}
			>
				{selectedClass && (
					<View style={styles.modalContent}>
						{/* Title & Course Code */}
						<Text style={styles.modalTitle}>{selectedClass.courseTitle.trim()}</Text>
						<Text style={styles.courseCode}>{selectedClass.courseCode}</Text>

						{/* First Card: Faculty, Type, Slot */}
						<View style={styles.card}>
							<View style={styles.row}>
								<Text style={styles.label}>Faculty</Text>
								<Text style={styles.value}>{selectedClass.faculty || 'Not Available'}</Text>
							</View>

							<View style={styles.row}>
								<Text style={styles.label}>Type</Text>
								<Text style={styles.value}>{selectedClass.type.toUpperCase()}</Text>
							</View>

							<View style={styles.row}>
								<Text style={styles.label}>Slot</Text>
								<Text style={styles.value}>{selectedClass.slot}</Text>
							</View>
						</View>

						{/* Second Card: Venue & Timings */}
						<View style={styles.card}>
							<View style={styles.row}>
								<Text style={styles.label}>Venue</Text>
								<Text style={styles.value}>{selectedClass.venue}</Text>
							</View>

							<View style={styles.row}>
								<Text style={styles.label}>Timings</Text>
								<Text style={styles.value}>
									{selectedClass.timings.start} - {selectedClass.timings.end}
								</Text>
							</View>
						</View>
					</View>
				)}
			</Modalize>
		</View>
	)
}

function sortClasses(data) {
	if (!data || data.classes.length === 0) return []
	const sorted = data.classes.slice().sort((a, b) => a.timings.start.localeCompare(b.timings.start))
	const merged = []
	let i = 0

	while (i < sorted.length) {
		const current = sorted[i]
		const next = sorted[i + 1]
		if (
			next &&
			current.type === 'lab' &&
			next.type === 'lab' &&
			current.courseCode === next.courseCode
		) {
			current.timings.end = next.timings.end
			merged.push(current)
			i += 2
		} else {
			merged.push(current)
			i++
		}
	}
	return merged
}
