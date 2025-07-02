import React, { useContext, useEffect, useState } from 'react'
import { Text, View, StyleSheet, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DropDownPicker from 'react-native-dropdown-picker'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { getColorTheme, getNewColorTheme } from '../constants/colorTheme/colorThemeMap'
import Icon from 'react-native-vector-icons/MaterialIcons'

export default function ColorTheme() {
	const { colorTheme, setColorTheme } = useContext(ColorThemeContext)

	const [mainOpen, setMainOpen] = useState(false)
	const [mainValue, setMainValue] = useState('dark')
	const [prevMainValue, setPrevMainValue] = useState('dark')

	const [accentOpen, setAccentOpen] = useState(false)
	const [accentValue, setAccentValue] = useState('red')
	const [prevAccentValue, setPrevAccentValue] = useState('red')

	const mainItems = [
		{ label: 'Dark', value: 'dark' },
		{ label: 'Light', value: 'light' },
	]

	const accentItems = [
		{ label: 'Black', value: 'black' },
		{ label: 'Blue', value: 'blue' },
		{ label: 'Green', value: 'green' },
		{ label: 'Red', value: 'red' },
		{ label: 'White', value: 'white' },
		{ label: 'Yellow', value: 'yellow' },
	]

	// Load stored theme on mount
	useEffect(() => {
		AsyncStorage.getItem('colorTheme').then((stored) => {
			if (stored) {
				const { main, accent } = JSON.parse(stored)
				setMainValue(main)
				setAccentValue(accent)
				setPrevMainValue(main)
				setPrevAccentValue(accent)
			}
		})
	}, [])

	const handleMainThemeChange = (newMain) => {
		if (newMain === prevMainValue) return // no change
		setMainValue(newMain)
		setPrevMainValue(newMain)
		const updated = { main: mainValue, accent: accentValue }
		const newColorTheme = getNewColorTheme(updated)
		AsyncStorage.setItem('colorTheme', JSON.stringify(updated))
		setColorTheme(newColorTheme)
		// Alert.alert('Restart required', 'Please restart the app to see the changes')
	}

	const handleAccentThemeChange = (newAccent) => {
		if (newAccent === prevAccentValue) return // no change
		setAccentValue(newAccent)
		setPrevAccentValue(newAccent)
		const updated = { main: mainValue, accent: accentValue }
		const newColorTheme = getNewColorTheme(updated)
		AsyncStorage.setItem('colorTheme', JSON.stringify(updated))
		setColorTheme(newColorTheme)
		// Alert.alert('Restart required', 'Please restart the app to see the changes')
	}

	const filteredAccent =
		mainValue === 'dark'
			? accentItems.filter((i) => i.value !== 'black')
			: mainValue === 'light'
			? accentItems.filter((i) => i.value !== 'white')
			: accentItems

	const styles = StyleSheet.create({
		container: { padding: 20, width: '100%' },
		heading: { color: colorTheme.main.text, fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
		setting: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
		label: { color: colorTheme.main.text, fontSize: 18, width: '70%' },
		picker: {
			width: '30%',
			zIndex: 100,
			backgroundColor: colorTheme.main.primary,
			borderColor: colorTheme.accent.tertiary,
			zIndex: 100,
		},
		dropDownBox: {
			backgroundColor: colorTheme.main.secondary,
			borderColor: colorTheme.accent.tertiary,
			width: '30%',
		},
	})
	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Color Theme</Text>

			{/* <View style={styles.setting}>
				<Text style={styles.label}>Main Color:</Text>
				<DropDownPicker
					dropDownDirection="AUTO"
					dropDownContainerStyle={styles.dropDownBox}
					style={styles.picker}
					textStyle={{ color: colorTheme.main.text }}
					labelStyle={{
						color: colorTheme.main.text,
					}}
					open={mainOpen}
					containerStyle={{ color: colorTheme.main.text }}
					ArrowDownIconComponent={({ style }) => (
						<Icon name="arrow-drop-down" size={24} color={colorTheme.main.text} style={style} />
					)}
					ArrowUpIconComponent={({ style }) => (
						<Icon name="arrow-drop-up" size={24} color={colorTheme.main.text} style={style} />
					)}
					showTickIcon={false}
					value={mainValue}
					items={mainItems}
					setOpen={setMainOpen}
					setValue={setMainValue}
					onChangeValue={handleMainThemeChange}
				/>
			</View> */}

			<View style={styles.setting}>
				<Text style={styles.label}>Accent Color:</Text>
				<DropDownPicker
					dropDownDirection="AUTO"
					dropDownContainerStyle={styles.dropDownBox}
					style={styles.picker}
					textStyle={{ color: colorTheme.main.text }}
					labelStyle={{ color: colorTheme.main.text }}
					open={accentOpen}
					value={accentValue}
					ArrowDownIconComponent={({ style }) => (
						<Icon name="arrow-drop-down" size={24} color={colorTheme.main.text} style={style} />
					)}
					ArrowUpIconComponent={({ style }) => (
						<Icon name="arrow-drop-up" size={24} color={colorTheme.main.text} style={style} />
					)}
					items={filteredAccent}
					setOpen={setAccentOpen}
					setValue={setAccentValue}
					onChangeValue={handleAccentThemeChange}
				/>
			</View>
		</View>
	)
}
