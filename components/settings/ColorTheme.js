import React, { useContext, useEffect, useState } from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DropDownPicker from 'react-native-dropdown-picker'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import { getColorTheme, getNewColorTheme } from '../../constants/colorTheme/colorThemeMap'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent, setUserProperty } from '@react-native-firebase/analytics'

const app = getApp()
const analytics = getAnalytics(app)

export default function ColorTheme({ openSheet }) {
	const { colorTheme, setColorTheme } = useContext(ColorThemeContext)

	const [mainOpen, setMainOpen] = useState(false)
	const [mainValue, setMainValue] = useState('dark')
	const [prevMainValue, setPrevMainValue] = useState('dark')

	const [accentOpen, setAccentOpen] = useState(false)
	const [accentValue, setAccentValue] = useState('blue')
	const [prevAccentValue, setPrevAccentValue] = useState('blue')

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

	const handleMainThemeChange = async (newMain) => {
		if (newMain === prevMainValue) return // no change
		setMainValue(newMain)
		setPrevMainValue(newMain)
		const updated = { main: mainValue, accent: accentValue }
		const newColorTheme = getNewColorTheme(updated)
		await AsyncStorage.setItem('colorTheme', JSON.stringify(updated))
		setColorTheme(newColorTheme)
		await AsyncStorage.removeItem('custom-theme')
		await logEvent(analytics, 'theme_changed_main', {
			type: 'main',
			main_theme: newMain,
			accent_theme: accentValue,
		})
		// Alert.alert('Restart required', 'Please restart the app to see the changes')
	}

	const handleAccentThemeChange = async (newAccent) => {
		if (newAccent === prevAccentValue) return // no change
		setAccentValue(newAccent)
		setPrevAccentValue(newAccent)
		const updated = { main: mainValue, accent: accentValue }
		const newColorTheme = getNewColorTheme(updated)
		await AsyncStorage.setItem('colorTheme', JSON.stringify(updated))
		setColorTheme(newColorTheme)
		await AsyncStorage.removeItem('custom-theme')
		await logEvent(analytics, 'theme_changed_accent', {
			type: 'accent',
			main_theme: mainValue,
			accent_theme: newAccent,
		})
		// Alert.alert('Restart required', 'Please restart the app to see the changes')
	}

	const filteredAccent =
		mainValue === 'dark'
			? accentItems.filter((i) => i.value !== 'black')
			: mainValue === 'light'
			? accentItems.filter((i) => i.value !== 'white')
			: accentItems

	const styles = StyleSheet.create({
		container: {
			width: '100%',
			borderBottomColor: colorTheme.main.tertiary,
			borderBottomWidth: 1,
		},
		heading: { color: colorTheme.main.text, fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
		setting: {
			flexDirection: 'row',
			width: '100%',
			// paddingVertical: 8,
			paddingHorizontal: 4,
			alignItems: 'center',
			justifyContent: 'space-between',
			alignSelf: 'center',
		},
		label: { color: colorTheme.main.text, fontSize: 15 },
		picker: {
			width: '100%',
			backgroundColor: colorTheme.main.primary,
			borderColor: colorTheme.accent.tertiary,
			zIndex: 100,
		},
		dropDownBox: {
			backgroundColor: colorTheme.main.secondary,
			borderColor: colorTheme.accent.tertiary,
			width: '100%',
			zIndex: 100,
		},
	})
	return (
		<View style={[styles.container]}>
			<View style={styles.setting}>
				<Text style={styles.label}>Accent Color:</Text>
				<View
					style={{
						width: '30%',
						backgroundColor: colorTheme.main.secondary,
						borderColor: colorTheme.accent.tertiary,
						zIndex: accentOpen ? 1000 : 0,
						position: 'relative',
					}}
				>
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
						zIndex={accentOpen ? 1000 : 0}
					/>
				</View>
			</View>

			<View style={[styles.setting, { marginTop: 20, marginBottom: 20 }]}>
				<Pressable onPress={() => openSheet()}>
					<Text style={styles.label}>Create a new theme!</Text>
				</Pressable>
			</View>
		</View>
	)
}
