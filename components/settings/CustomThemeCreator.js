import React, { forwardRef, useContext, useState, useRef, useEffect, useMemo } from 'react'
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	ScrollView,
	Dimensions,
	Modal,
	Animated,
	TextInput,
	KeyboardAvoidingView,
	Platform,
} from 'react-native'
import { Modalize } from 'react-native-modalize'
import ColorPicker from 'react-native-wheel-color-picker'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getApp } from '@react-native-firebase/app'
import { getAnalytics, logEvent } from '@react-native-firebase/analytics'

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
	const [hexInput, setHexInput] = useState(mainPrimary)

	const [showResetModal, setShowResetModal] = useState(false)
	const [unsavedChanges, setUnsavedChanges] = useState(false)

	const handleColorEdit = (color, setter) => {
		setCurrentColor(color)
		setCurrentSetter(() => setter)
	}

	const handleColorChange = (color) => {
		setCurrentColor(color)
		setHexInput(color.toUpperCase())
		currentSetter(color)

		setColorTheme((prev) => {
			const newTheme = JSON.parse(JSON.stringify(prev))
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

		setUnsavedChanges(true)
	}

	const handleResetConfirm = () => {
		setShowResetModal(false)
		handleReset()
	}

	const handleReset = () => {
		const resetTheme = JSON.parse(JSON.stringify(initialTheme))

		setMainPrimary(resetTheme.main.primary)
		setMainSecondary(resetTheme.main.secondary)
		setMainTertiary(resetTheme.main.tertiary)
		setMainText(resetTheme.main.text)
		setAccentPrimary(resetTheme.accent.primary)
		setAccentSecondary(resetTheme.accent.secondary)
		setAccentTertiary(resetTheme.accent.tertiary)

		setColorTheme(resetTheme)
		setCurrentColor(resetTheme.main.primary)
		setCurrentSetter((prev) => {
			return () => {}
		})
		setUnsavedChanges(false)
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
		setUnsavedChanges(false)

		await logEvent(analytics, 'custom_theme_saved', {
			type: 'custom',
			...new_theme.main,
			...new_theme.accent,
		})
	}

	const styles = StyleSheet.create({
		container: {
			paddingVertical: 30,
			paddingHorizontal: 20,
			backgroundColor: colorTheme.main.secondary,
		},
		heading: {
			color: colorTheme.accent.primary,
			fontSize: 24,
			fontWeight: 'bold',
			marginBottom: 10,
			textAlign: 'center',
		},
		note: {
			color: colorTheme.main.text,
			fontSize: 13,
			fontStyle: 'italic',
			marginBottom: 10,
			textAlign: 'center',
			opacity: 0.8,
		},
		sectionHeader: {
			color: colorTheme.main.text,
			fontSize: 18,
			fontWeight: '700',
			marginBottom: 10,
		},
		previewRow: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 12,
			justifyContent: 'space-evenly',
			marginBottom: 16,
		},
		previewWrapper: { width: '22%', alignItems: 'center' },
		previewBox: { width: '100%', height: 50, borderRadius: 8, borderWidth: 2, margin: 6 },
		previewLabel: { color: '#ccc', fontSize: 11, textAlign: 'center', marginTop: 5 },
		buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
		button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
		saveButton: { backgroundColor: colorTheme.accent.primary },
		resetButton: { backgroundColor: colorTheme.main.tertiary },
		saveText: { color: colorTheme.main.primary, fontWeight: 'bold', fontSize: 16 },
		resetText: { color: colorTheme.main.text, fontWeight: 'bold', fontSize: 16 },
		colorHex: { textAlign: 'center', color: colorTheme.main.text, marginBottom: 10 },
		previewCard: {
			backgroundColor: colorTheme.main.primary,
			padding: 15,
			borderRadius: 12,
			marginBottom: 20,
			alignItems: 'center',
		},
		previewButton: {
			backgroundColor: colorTheme.accent.primary,
			paddingVertical: 10,
			paddingHorizontal: 20,
			borderRadius: 8,
			marginTop: 10,
		},
		previewButtonText: { color: colorTheme.main.primary, fontWeight: 'bold' },
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
			keyboardAvoidingBehavior="padding"
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					contentContainerStyle={styles.container}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<Text style={styles.heading}>🎨 Customize Your Theme</Text>
					{unsavedChanges && (
						<Text style={[styles.note, { color: 'orange' }]}>⚠ You have unsaved changes</Text>
					)}

					<Text style={styles.note}>
						Changes update live across the app.{'\n'}
						Use the{' '}
						<Text style={{ fontWeight: 'bold', color: colorTheme.accent.secondary }}>
							Reset
						</Text>{' '}
						button if needed.
					</Text>

					{/* Live Preview Card */}
					<View style={styles.previewCard}>
						<Text style={{ color: colorTheme.main.text, fontWeight: 'bold' }}>Live Preview</Text>
						<Pressable style={styles.previewButton}>
							<Text style={styles.previewButtonText}>Sample Button</Text>
						</Pressable>
					</View>

					<Text style={styles.sectionHeader}>Main Colors</Text>
					<View style={styles.previewRow}>
						{mainPickers.map(({ label, color, setter }) => (
							<Pressable
								key={label}
								style={styles.previewWrapper}
								onPress={() => handleColorEdit(color, setter)}
							>
								<View
									style={[
										styles.previewBox,
										{
											backgroundColor: color,
											borderColor: color === currentColor ? '#fff' : '#888',
										},
									]}
								/>
								<Text style={styles.previewLabel}>{label}</Text>
							</Pressable>
						))}
					</View>

					<Text style={styles.sectionHeader}>Accent Colors</Text>
					<View style={styles.previewRow}>
						{accentPickers.map(({ label, color, setter }) => (
							<Pressable
								key={label}
								style={styles.previewWrapper}
								onPress={() => handleColorEdit(color, setter)}
							>
								<View
									style={[
										styles.previewBox,
										{
											backgroundColor: color,
											borderColor: color === currentColor ? '#fff' : '#888',
										},
									]}
								/>
								<Text style={styles.previewLabel}>{label}</Text>
							</Pressable>
						))}
					</View>

					<Text style={styles.sectionHeader}>Color Picker</Text>

					<View style={{ height: 250, marginBottom: 20 }}>
						<ColorPicker
							color={currentColor}
							onColorChange={handleColorChange}
							thumbSize={30}
							sliderSize={30}
							noSnap
							row
						/>
					</View>
					<View style={{ alignItems: 'center', marginBottom: 20 }}>
						<TextInput
							style={{
								width: 150,
								paddingVertical: 8,
								borderWidth: 1,
								borderColor: '#aaa',
								borderRadius: 8,
								textAlign: 'center',
								color: colorTheme.main.text,
								backgroundColor: colorTheme.main.primary,
								fontWeight: 'bold',
							}}
							value={hexInput}
							onChangeText={(text) => {
								setHexInput(text)
								const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
								if (hexRegex.test(text)) {
									handleColorChange(text)
								}
							}}
							placeholder="#000"
							placeholderTextColor="#7E7E7EFF"
							maxLength={7}
							autoCapitalize="none"
						/>
						<Text style={{ fontSize: 12, color: colorTheme.main.text, marginTop: 5 }}>
							Enter HEX (e.g. #FF5733)
						</Text>
					</View>
					<View style={styles.buttonRow}>
						<Pressable
							style={[styles.button, styles.resetButton]}
							onPress={() => setShowResetModal(true)}
						>
							<Text style={styles.resetText}>Reset</Text>
						</Pressable>
						<Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
							<Text style={styles.saveText}>Save</Text>
						</Pressable>
					</View>

					{/* Reset Confirmation Modal */}
					<Modal visible={showResetModal} transparent animationType="fade">
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor: 'rgba(0,0,0,0.4)',
							}}
						>
							<View
								style={{
									backgroundColor: colorTheme.main.secondary,
									padding: 20,
									borderRadius: 10,
									width: '80%',
								}}
							>
								<Text
									style={{
										color: colorTheme.main.text,
										fontSize: 18,
										fontWeight: 'bold',
										marginBottom: 10,
									}}
								>
									Reset Theme?
								</Text>
								<Text style={{ color: colorTheme.main.text, marginBottom: 20 }}>
									Are you sure you want to reset to the default theme? This action cannot be undone.
								</Text>
								<View style={styles.buttonRow}>
									<Pressable
										style={[styles.button, styles.resetButton]}
										onPress={() => setShowResetModal(false)}
									>
										<Text style={styles.resetText}>Cancel</Text>
									</Pressable>
									<Pressable
										style={[styles.button, styles.saveButton]}
										onPress={handleResetConfirm}
									>
										<Text style={styles.saveText}>Reset</Text>
									</Pressable>
								</View>
							</View>
						</View>
					</Modal>
				</ScrollView>
			</KeyboardAvoidingView>
		</Modalize>
	)
})

export default CustomThemeCreator
