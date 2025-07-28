import React, { forwardRef, useContext, useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Modalize } from 'react-native-modalize'
import ColorPicker from 'react-native-wheel-color-picker'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent, setUserProperty } from '@react-native-firebase/analytics'

const app = getApp()
const analytics = getAnalytics(app)

const screenHeight = Dimensions.get('window').height

const CustomThemeCreator = forwardRef((props, ref) => {
	const { colorTheme, setColorTheme } = useContext(ColorThemeContext)

	const initialThemeRef = useRef(colorTheme)
	const initialTheme = initialThemeRef.current

	// Main colors
	const [mainPrimary, setMainPrimary] = useState(initialTheme.main.primary)
	const [mainSecondary, setMainSecondary] = useState(initialTheme.main.secondary)
	const [mainTertiary, setMainTertiary] = useState(initialTheme.main.tertiary)
	const [mainText, setMainText] = useState(initialTheme.main.text)

	// Accent colors
	const [accentPrimary, setAccentPrimary] = useState(initialTheme.accent.primary)
	const [accentSecondary, setAccentSecondary] = useState(initialTheme.accent.secondary)
	const [accentTertiary, setAccentTertiary] = useState(initialTheme.accent.tertiary)

	// Picker state
	const [currentColor, setCurrentColor] = useState(mainPrimary)
	const [currentSetter, setCurrentSetter] = useState(() => setMainPrimary)

	const handleColorEdit = (color, setter) => {
		setCurrentColor(color)
		setCurrentSetter(() => setter)
	}

	function doNothing(param) {}

	const handleColorChange = (color) => {
		setCurrentColor(color)
		currentSetter(color)

		setColorTheme((prev) => {
			const newTheme = JSON.parse(JSON.stringify(prev)) // deep clone
			switch (currentSetter) {
				case setMainPrimary:
					newTheme.main.primary = color
					break
				case setMainSecondary:
					newTheme.main.secondary = color
					break
				case setMainTertiary:
					newTheme.main.tertiary = color
					break
				case setMainText:
					newTheme.main.text = color
					break
				case setAccentPrimary:
					newTheme.accent.primary = color
					break
				case setAccentSecondary:
					newTheme.accent.secondary = color
					break
				case setAccentTertiary:
					newTheme.accent.tertiary = color
					break
			}
			return newTheme
		})
	}

	const handleReset = () => {
		const resetTheme = {
			main: {
				primary: initialTheme.main.primary,
				secondary: initialTheme.main.secondary,
				tertiary: initialTheme.main.tertiary,
				text: initialTheme.main.text,
			},
			accent: {
				primary: initialTheme.accent.primary,
				secondary: initialTheme.accent.secondary,
				tertiary: initialTheme.accent.tertiary,
			},
		}

		setMainPrimary(resetTheme.main.primary)
		setMainSecondary(resetTheme.main.secondary)
		setMainTertiary(resetTheme.main.tertiary)
		setMainText(resetTheme.main.text)
		setAccentPrimary(resetTheme.accent.primary)
		setAccentSecondary(resetTheme.accent.secondary)
		setAccentTertiary(resetTheme.accent.tertiary)

		setColorTheme(resetTheme)

		// Determine the correct color + setter to reapply to picker
		const fallbackSetter = setMainPrimary
		const fallbackColor = resetTheme.main.primary

		let matchedColor = fallbackColor
		let matchedSetter = fallbackSetter

		switch (currentSetter) {
			case setMainPrimary:
				matchedColor = resetTheme.main.primary

				break
			case setMainSecondary:
				matchedColor = resetTheme.main.secondary

				break
			case setMainTertiary:
				matchedColor = resetTheme.main.tertiary

				break
			case setMainText:
				matchedColor = resetTheme.main.text

				break
			case setAccentPrimary:
				matchedColor = resetTheme.accent.primary

				break
			case setAccentSecondary:
				matchedColor = resetTheme.accent.secondary

				break
			case setAccentTertiary:
				matchedColor = resetTheme.accent.tertiary

				break
		}

		setCurrentColor(matchedColor)
		setCurrentSetter(() => doNothing)
	}

	const handleSave = async () => {
		const new_theme = {
			main: {
				primary: mainPrimary,
				secondary: mainSecondary,
				tertiary: mainTertiary,
				text: mainText,
			},
			accent: {
				primary: accentPrimary,
				secondary: accentSecondary,
				tertiary: accentTertiary,
			},
		}

		setColorTheme(new_theme)
		await AsyncStorage.setItem('custom-theme', JSON.stringify(new_theme))
		ref?.current?.close()

		await logEvent(analytics, 'custom_theme_saved', {
			type: 'custom',
			main_primary: new_theme.main.primary,
			main_secondary: new_theme.main.secondary,
			main_tertiary: new_theme.main.tertiary,
			main_text: new_theme.main.text,
			accent_primary: new_theme.accent.primary,
			accent_secondary: new_theme.accent.secondary,
			accent_tertiary: new_theme.accent.tertiary,
		})
	}

	const styles = StyleSheet.create({
		container: {
			paddingVertical: 30,
			paddingHorizontal: 20,
			// paddingBottom: 100,
			backgroundColor: colorTheme.main.secondary,
		},
		heading: {
			color: colorTheme.accent.primary,
			fontSize: 24,
			fontWeight: 'bold',
			marginBottom: 20,
			textAlign: 'center',
		},
		sectionHeader: {
			color: colorTheme.main.text,
			fontSize: 18,
			fontWeight: '700',
			// marginTop: 25,
			marginBottom: 10,
		},
		label: {
			color: '#ccc',
			marginTop: 15,
			marginBottom: 5,
			fontSize: 15,
			fontWeight: '600',
		},
		previewRow: {
			paddingVertical: 10,
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 12,
			marginBottom: 16,
		},

		previewBox: {
			width: 70,
			height: 50,
			borderRadius: 8,
			borderWidth: 2,
			borderColor: '#888888',
			margin: 6,
		},
		buttonRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginTop: 40,
			gap: 12,
		},
		button: {
			flex: 1,
			paddingVertical: 14,
			borderRadius: 10,
			alignItems: 'center',
		},
		saveButton: {
			backgroundColor: colorTheme.accent.primary,
		},
		resetButton: {
			backgroundColor: colorTheme.main.tertiary,
		},
		saveText: {
			color: colorTheme.main.primary,
			fontWeight: 'bold',
			fontSize: 16,
		},
		resetText: {
			color: colorTheme.main.text,
			fontWeight: 'bold',
			fontSize: 16,
		},
		note: {
			color: colorTheme.main.text,
			fontSize: 13,
			fontStyle: 'italic',
			marginBottom: 20,
			textAlign: 'center',
			lineHeight: 18,
			opacity: 0.8,
		},
	})

	const mainPickers = [
		{ label: 'Primary', color: mainPrimary, setter: setMainPrimary },
		{ label: 'Secondary', color: mainSecondary, setter: setMainSecondary },
		{ label: 'Tertiary', color: mainTertiary, setter: setMainTertiary },
		{ label: 'Text', color: mainText, setter: setMainText },
	]

	const accentPickers = [
		{ label: 'Primary', color: accentPrimary, setter: setAccentPrimary },
		{ label: 'Secondary', color: accentSecondary, setter: setAccentSecondary },
		{ label: 'Tertiary', color: accentTertiary, setter: setAccentTertiary },
	]

	return (
		<Modalize
			ref={ref}
			snapPoint={screenHeight}
			handleStyle={{ backgroundColor: colorTheme.accent.primary }}
			modalStyle={{
				backgroundColor: colorTheme.main.secondary,
				borderTopColor: colorTheme.accent.primary,
				borderTopWidth: 3,
			}}
		>
			<ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
				<Text style={styles.heading}>🎨 Customize Your Theme</Text>

				<Text style={styles.note}>
					Color changes update live across the app — feel free to preview them on other pages and
					come back to save. Your draft will be preserved until the app restarts.{'\n'} If you mess
					up, just use the{' '}
					<Text style={{ fontWeight: 'bold', color: colorTheme.accent.secondary }}>Reset</Text>{' '}
					button below.
				</Text>

				<Text style={styles.sectionHeader}>Main Colors</Text>
				<View style={styles.previewRow}>
					{mainPickers.map(({ label, color, setter }) => (
						<Pressable key={label} onPress={() => handleColorEdit(color, setter)}>
							<View style={styles.previewBox}>
								<View style={[styles.previewBox, { backgroundColor: color }]} />
								<Text style={{ color: '#ccc', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
									{label}
								</Text>
							</View>
						</Pressable>
					))}
				</View>

				<Text style={[styles.sectionHeader, { marginTop: 25 }]}>Accent Colors</Text>
				<View style={styles.previewRow}>
					{accentPickers.map(({ label, color, setter }) => (
						<Pressable key={label} onPress={() => handleColorEdit(color, setter)}>
							<View style={styles.previewBox}>
								<View style={[styles.previewBox, { backgroundColor: color }]} />
								<Text style={{ color: '#ccc', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
									{label}
								</Text>
							</View>
						</Pressable>
					))}
				</View>

				<Text style={[styles.sectionHeader, { marginTop: 30 }]}>Color Picker</Text>
				<View style={{ height: 250, marginBottom: 20 }}>
					<ColorPicker
						color={currentColor}
						onColorChange={handleColorChange}
						thumbSize={30}
						sliderSize={30}
						noSnap={true}
						row={true}
					/>
				</View>

				<View style={styles.buttonRow}>
					<Pressable style={[styles.button, styles.resetButton]} onPress={handleReset}>
						<Text style={styles.resetText}>Reset</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
						<Text style={styles.saveText}>Save</Text>
					</Pressable>
				</View>
			</ScrollView>
		</Modalize>
	)
})

export default CustomThemeCreator
