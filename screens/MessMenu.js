import { useContext, useState, useEffect, useRef } from 'react'
import {
	Text,
	View,
	Pressable,
	ScrollView,
	ActivityIndicator,
	Dimensions,
	ToastAndroid,
	Animated,
	Platform,
	Modal,
} from 'react-native'
import { Calendar } from 'react-native-calendars'
import Octicons from '@expo/vector-icons/Octicons'
import { ColorThemeContext } from '../context/ColorThemeContext'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as XLSX from 'xlsx'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Buffer } from 'buffer'
global.Buffer = Buffer

function isSameMonth(d1, d2) {
	return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
}

export default function MessMenu() {
	const { colorTheme } = useContext(ColorThemeContext)

	const [title, setTitle] = useState(null)
	const [todayMenu, setTodayMenu] = useState(null)
	const [specialItems, setSpecialItems] = useState({})
	const [filePicked, setFilePicked] = useState(false)
	const [loading, setLoading] = useState(true)
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [fileUri, setFileUri] = useState(null)
	const [parsed, setParsed] = useState(null)

	const scrollRef = useRef(null)
	const screenWidth = Dimensions.get('window').width
	const screenHeight = Dimensions.get('window').height

	const mealKeys = ['breakfast', 'lunch', 'snacks', 'dinner']
	const animatedHeights = useRef(mealKeys.map(() => new Animated.Value(screenHeight * 0.3))).current

	const currentMealIndexRef = useRef(getCurrentMealIndex())

	const hasAutoScrolledRef = useRef(false)

	useEffect(() => {
		loadSavedFile()
	}, [])

	useEffect(() => {
		if (filePicked && todayMenu && !hasAutoScrolledRef.current) {
			setTimeout(() => {
				const target = getCurrentMealIndex()
				currentMealIndexRef.current = target
				scrollRef.current?.scrollTo({ x: target * screenWidth, animated: true })
				hasAutoScrolledRef.current = true
			}, 180)
		}
	}, [filePicked, todayMenu])

	useEffect(() => {
		if (!todayMenu) return
		mealKeys.forEach((mealKey, index) => {
			const itemCount = todayMenu[mealKey]?.length || 1
			const targetHeight = Math.min(itemCount * 26 + 130, screenHeight * 0.55)
			Animated.spring(animatedHeights[index], {
				toValue: targetHeight,
				useNativeDriver: false,
				bounciness: 12,
			}).start()
		})
	}, [todayMenu])

	function getCurrentMealIndex() {
		const now = new Date()
		const hours = now.getHours()
		const minutes = now.getMinutes()
		const time = hours + minutes / 60
		if (time < 9) return 0
		if (time < 14) return 1
		if (time < 18.5) return 2
		return 3
	}

	function scrollToMealIndex(index, animated = true) {
		if (scrollRef.current) {
			scrollRef.current.scrollTo({ x: index * screenWidth, animated })
		}
	}

	function scrollToCurrentMeal() {
		const index = getCurrentMealIndex()
		scrollToMealIndex(index)
		currentMealIndexRef.current = index
	}

	async function loadSavedFile() {
		try {
			const savedUri = await AsyncStorage.getItem('mess_menu_file_uri')
			if (savedUri) {
				setFileUri(savedUri)
				await parseExcelFile(savedUri, selectedDate)
				setFilePicked(true)
			}
		} catch (err) {
			console.error('Error loading saved file:', err)
		} finally {
			setLoading(false)
		}
	}
	async function pickExcelFile() {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: [
					'application/vnd.ms-excel',
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				],
				copyToCacheDirectory: true,
				multiple: false,
			})

			if (result.canceled || !result.assets?.length) {
				setLoading(false)
				return
			}

			const file = result.assets[0]
			await AsyncStorage.setItem('mess_menu_file_uri', file.uri)
			setFileUri(file.uri)
			await parseExcelFile(file.uri, selectedDate)
			setFilePicked(true)
		} catch (err) {
			console.error('❌ Error picking file:', err)
			ToastAndroid.show('Failed to parse Excel file', ToastAndroid.SHORT)
			setLoading(false)
		}
	}

	async function parseExcelFile(fileUri, dateObj = new Date()) {
		try {
			let workbook = parsed
			if (!workbook) {
				const base64 = await FileSystem.readAsStringAsync(fileUri, {
					encoding: FileSystem.EncodingType.Base64,
				})
				const binary = Buffer.from(base64, 'base64')
				workbook = XLSX.read(binary, { type: 'buffer' })
				setParsed(workbook)
			}

			const mainSheetName = workbook.SheetNames[0]
			const extraSheetName = workbook.SheetNames[1] || null

			const mainSheet = workbook.Sheets[mainSheetName]
			const extraSheet = extraSheetName ? workbook.Sheets[extraSheetName] : null

			const rangeMain = XLSX.utils.decode_range(mainSheet['!ref'])
			const rangeExtra = extraSheet ? XLSX.utils.decode_range(extraSheet['!ref']) : null

			const getColumn = (sheet, range, colLetter) => {
				const col = []
				for (let R = range.s.r; R <= range.e.r; ++R) {
					const cellAddress = colLetter + (R + 1)
					const cell = sheet[cellAddress]
					col.push(cell ? String(cell.v).trim() : '')
				}
				return col
			}

			const dates = getColumn(mainSheet, rangeMain, 'A')
			const breakfasts = getColumn(mainSheet, rangeMain, 'B')
			const lunches = getColumn(mainSheet, rangeMain, 'C')
			const snacks = getColumn(mainSheet, rangeMain, 'D')
			const dinners = getColumn(mainSheet, rangeMain, 'E')

			let breakfasts2 = [],
				lunches2 = [],
				snacks2 = [],
				dinners2 = []

			if (extraSheet) {
				breakfasts2 = getColumn(extraSheet, rangeExtra, 'B')
				lunches2 = getColumn(extraSheet, rangeExtra, 'C')
				snacks2 = getColumn(extraSheet, rangeExtra, 'D')
				dinners2 = getColumn(extraSheet, rangeExtra, 'E')
			}

			const extractedTitle =
				Object.values(mainSheet)
					.map((c) => (c?.v && typeof c.v === 'string' ? c.v.trim() : ''))
					.find((text) => /menu/i.test(text)) || 'Mess Menu'

			const currentDate = dateObj.getDate().toString().padStart(2, '0')

			let startIndex = dates.findIndex((v) => new RegExp(`\\b${currentDate}\\b`).test(v))
			if (startIndex === -1) throw new Error(`No menu found for ${currentDate}`)

			let endIndex = startIndex + 1
			while (endIndex < dates.length && !dates[endIndex]) endIndex++

			const collectItems = (main, extra) => {
				const baseItems = main.slice(startIndex, endIndex).filter((v) => v && v.trim())
				const extraItems = extra.slice(startIndex, endIndex).filter((v) => v && v.trim())
				const special = extraItems.filter((x) => !baseItems.includes(x))
				return { all: [...baseItems, ...special], special }
			}

			const breakfastData = collectItems(breakfasts, breakfasts2)
			const lunchData = collectItems(lunches, lunches2)
			const snackData = collectItems(snacks, snacks2)
			const dinnerData = collectItems(dinners, dinners2)

			setTitle(extractedTitle)
			setTodayMenu({
				day: dateObj.toDateString(),
				breakfast: breakfastData.all,
				lunch: lunchData.all,
				snacks: snackData.all,
				dinner: dinnerData.all,
			})
			setSpecialItems({
				breakfast: breakfastData.special,
				lunch: lunchData.special,
				snacks: snackData.special,
				dinner: dinnerData.special,
			})

			setTimeout(() => {
				const idx = hasAutoScrolledRef.current ? currentMealIndexRef.current : getCurrentMealIndex()
				currentMealIndexRef.current = idx
				scrollToMealIndex(idx, true)
				hasAutoScrolledRef.current = true
			}, 140)
		} catch (err) {
			console.error('❌ Error parsing Excel:', err)
			ToastAndroid.show('Failed to parse Excel file', ToastAndroid.SHORT)
			await AsyncStorage.removeItem('mess_menu_file_uri')
		}
	}

	const resetFile = async () => {
		await AsyncStorage.removeItem('mess_menu_file_uri')
		setFilePicked(false)
		setTodayMenu(null)
		setTitle(null)
		setSpecialItems({})
		setFileUri(null)
		setParsed(null)
		hasAutoScrolledRef.current = false
		currentMealIndexRef.current = getCurrentMealIndex()
	}

	const currentMonth = new Date().getMonth()
	const currentYear = new Date().getFullYear()
	const minDate = new Date(currentYear, currentMonth - 1)
	const maxDate = new Date(currentYear, currentMonth + 1, 1)
	const lastDay = new Date(currentYear, currentMonth + 1, 0)

	const prevDay = async () => {
		const newDate = new Date(selectedDate)
		newDate.setDate(selectedDate.getDate() - 1)

		if (!isSameMonth(newDate, selectedDate)) return

		setSelectedDate(newDate)
		await parseExcelFile(fileUri, newDate)
	}
	const nextDay = async () => {
		const newDate = new Date(selectedDate)
		newDate.setDate(selectedDate.getDate() + 1)

		if (!isSameMonth(newDate, selectedDate)) return

		setSelectedDate(newDate)
		await parseExcelFile(fileUri, newDate)
	}

	function isToday(date) {
		const now = new Date()
		return (
			date.getDate() === now.getDate() &&
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear()
		)
	}

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color={colorTheme.accent.primary} />
			</View>
		)
	}

	if (!filePicked) {
		return (
			<View
				style={{
					marginTop: 50,
					alignItems: 'center',
					justifyContent: 'center',
					padding: 20,
				}}
			>
				<Text
					style={{
						color: colorTheme.main.text,
						fontSize: 18,
						marginBottom: 20,
						textAlign: 'center',
						fontWeight: '600',
						opacity: 0.9,
					}}
				>
					Select your Mess Menu Excel file
				</Text>

				<Pressable
					onPress={pickExcelFile}
					style={{
						backgroundColor: colorTheme.accent.primary,
						paddingVertical: 14,
						paddingHorizontal: 36,
						borderRadius: 14,
						elevation: 4,
						shadowColor: colorTheme.accent.primary,
					}}
				>
					<Text
						style={{
							color: colorTheme.main.primary,
							fontWeight: 'bold',
							fontSize: 16,
						}}
					>
						Pick File
					</Text>
				</Pressable>
			</View>
		)
	}

	return (
		<View style={{ paddingVertical: 10, flex: 1 }}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					marginVertical: 25,
				}}
			>
				<Pressable
					disabled={
						!isSameMonth(
							new Date(
								selectedDate.getFullYear(),
								selectedDate.getMonth(),
								selectedDate.getDate() - 1
							),
							selectedDate
						)
					}
					onPress={prevDay}
					style={{
						paddingHorizontal: 15,
						paddingVertical: 8,
						opacity: !isSameMonth(
							new Date(
								selectedDate.getFullYear(),
								selectedDate.getMonth(),
								selectedDate.getDate() - 1
							),
							selectedDate
						)
							? 0.3
							: 1,
					}}
				>
					<Octicons name="chevron-left" size={26} color={colorTheme.accent.secondary} />
				</Pressable>

				<Pressable
					onPress={() => setShowDatePicker(true)}
					style={{
						// backgroundColor: colorTheme.accent.secondary,
						paddingVertical: 10,
						paddingHorizontal: 0,
						borderRadius: 10,
						elevation: 8,
						marginHorizontal: 20,
					}}
				>
					<Text
						style={{
							fontSize: 16,
							fontWeight: '700',
							color: isToday(selectedDate)
								? colorTheme.accent.primary
								: colorTheme.accent.secondary,
							opacity: isToday(selectedDate) ? 1 : 0.9,
							textAlign: 'center',
						}}
					>
						{todayMenu?.day ?? selectedDate.toDateString()}
					</Text>
				</Pressable>

				<Pressable
					disabled={
						!isSameMonth(
							new Date(
								selectedDate.getFullYear(),
								selectedDate.getMonth(),
								selectedDate.getDate() + 1
							),
							selectedDate
						)
					}
					onPress={nextDay}
					style={{
						paddingHorizontal: 15,
						paddingVertical: 8,
						opacity: !isSameMonth(
							new Date(
								selectedDate.getFullYear(),
								selectedDate.getMonth(),
								selectedDate.getDate() + 1
							),
							selectedDate
						)
							? 0.3
							: 1,
					}}
				>
					<Octicons name="chevron-right" size={26} color={colorTheme.accent.secondary} />
				</Pressable>
			</View>

			{title && (
				<Text
					style={{
						textAlign: 'center',
						color: colorTheme.main.text,
						opacity: 0.6,
						fontSize: 12,
						paddingHorizontal: 40,
						marginTop: -10,
						marginBottom: 10,
						fontStyle: 'italic',
					}}
				>
					🗂️ {title}
				</Text>
			)}

			<Modal
				visible={showDatePicker}
				transparent
				animationType="fade"
				onRequestClose={() => setShowDatePicker(false)}
			>
				<Pressable
					onPress={() => setShowDatePicker(false)}
					style={{
						flex: 1,
						backgroundColor: 'rgba(0,0,0,0.85)',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Pressable
						onPress={(e) => e.stopPropagation()}
						style={{
							backgroundColor: colorTheme.main.primary,
							marginHorizontal: 20,
							borderRadius: 16,
							borderColor: colorTheme.main.tertiary,
							borderWidth: 2,
							elevation: 5,
							shadowColor: colorTheme.accent.primary,
							padding: 10,
							width: '90%',
							maxWidth: 400,
						}}
					>
						<Calendar
							current={selectedDate.toISOString().split('T')[0]}
							minDate={minDate.toISOString().split('T')[0]}
							onDayPress={async (day) => {
								const selected = new Date(day.dateString)
								setSelectedDate(selected)
								if (fileUri) await parseExcelFile(fileUri, selected)
								setShowDatePicker(false)
							}}
							hideArrows
							hideExtraDays
							enableSwipeMonths={false}
							markedDates={{
								[selectedDate.toISOString().split('T')[0]]: {
									selected: true,
									selectedColor: colorTheme.accent.secondary,
									selectedTextColor: colorTheme.main.primary,
								},
							}}
							theme={{
								backgroundColor: colorTheme.main.primary,
								calendarBackground: colorTheme.main.primary,
								textSectionTitleColor: colorTheme.accent.primary,
								selectedDayBackgroundColor: colorTheme.accent.primary,
								selectedDayTextColor: colorTheme.main.primary,
								todayTextColor: colorTheme.accent.primary,
								dayTextColor: colorTheme.main.text,
								monthTextColor: colorTheme.accent.primary,
								textMonthFontWeight: 'bold',
								textMonthFontSize: 18,
								arrowColor: colorTheme.accent.primary,
							}}
							style={{
								borderRadius: 12,
							}}
						/>
					</Pressable>
				</Pressable>
			</Modal>

			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={true}
				ref={scrollRef}
				onMomentumScrollEnd={(e) => {
					const page = Math.round(e.nativeEvent.contentOffset.x / screenWidth)
					if (page >= 0 && page < mealKeys.length) {
						currentMealIndexRef.current = page
					}
				}}
			>
				{mealKeys.map((mealKey, i) => (
					<Animated.View
						key={mealKey}
						style={{
							width: screenWidth - 50,
							marginTop: 20,
							marginHorizontal: 25,
							borderColor: colorTheme.main.tertiary,
							borderWidth: 1.8,
							borderRadius: 18,
							padding: 20,
							paddingBottom: 0,
							shadowColor: colorTheme.accent.secondary,
							height: animatedHeights[i],
							overflow: 'hidden',
						}}
					>
						<Text
							style={{
								color: colorTheme.main.primary,
								fontWeight: 'bold',
								fontSize: 18,
								width: '100%',
								padding: 10,
								marginBottom: 10,
								backgroundColor: colorTheme.accent.secondary,
								borderRadius: 10,
								textAlign: 'center',
							}}
						>
							{mealKey === 'breakfast'
								? '🍽️ Breakfast'
								: mealKey === 'lunch'
								? '🥗 Lunch'
								: mealKey === 'snacks'
								? '☕ Snacks'
								: '🌙 Dinner'}
						</Text>

						<ScrollView
							contentContainerStyle={{ paddingBottom: 0 }}
							showsVerticalScrollIndicator={true}
						>
							{todayMenu?.[mealKey]?.length ? (
								todayMenu[mealKey].map((item, j) => {
									const isSpecial = specialItems[mealKey]?.includes(item)
									return (
										<Text
											key={j}
											style={{
												color: isSpecial ? colorTheme.accent.secondary : colorTheme.main.text,
												fontSize: 13,
												marginBottom: 6,
											}}
										>
											• {item}
										</Text>
									)
								})
							) : (
								<Text
									style={{
										color: colorTheme.main.text,
										opacity: 0.6,
										textAlign: 'center',
									}}
								>
									—
								</Text>
							)}
						</ScrollView>

						<Text
							style={{
								color: colorTheme.accent.secondary,
								marginBottom: 8,
								textAlign: 'right',
							}}
						>
							*special items
						</Text>
					</Animated.View>
				))}
			</ScrollView>

			<Pressable
				onPress={resetFile}
				style={{
					marginTop: 15,
					backgroundColor: colorTheme.accent.secondary,
					paddingVertical: 12,
					borderRadius: 12,
					alignItems: 'center',
					marginHorizontal: 60,
					elevation: 3,
				}}
			>
				<Text
					style={{
						color: colorTheme.main.primary,
						fontWeight: 'bold',
						fontSize: 15,
					}}
				>
					Choose Another File
				</Text>
			</Pressable>
		</View>
	)
}
