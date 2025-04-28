import React, { useState, useCallback, useContext, useLayoutEffect } from 'react'
import { ScrollView, RefreshControl, Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native'
import ClassItem from './ClassItem'

export default function TimeTableDisplay({ route }) {
	const { colorTheme } = useContext(ColorThemeContext)
	let { data } = route.params

	if (!data || data.length === 0 || data[0].classes.length === 0) {
		return <Text style={{ color: 'white' }}>No classes for this day!</Text>
	}
	data = data[0]
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
			data={data.classes}
			keyExtractor={(item) => item.class}
			renderItem={({ item }) => <ClassItem item={item} />}
			refreshing={refreshing}
			onRefresh={onRefresh}
		/>
	)
}
