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
} from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as XLSX from 'xlsx'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Buffer } from 'buffer'
global.Buffer = Buffer

export default function MessMenu() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [title, setTitle] = useState(null)
	const [todayMenu, setTodayMenu] = useState(null)
	const [specialItems, setSpecialItems] = useState({})
	const [filePicked, setFilePicked] = useState(false)
	const [loading, setLoading] = useState(true)
	const scrollRef = useRef(null)
	const screenWidth = Dimensions.get('window').width
	const screenHeight = Dimensions.get('window').height

	const mealKeys = ['breakfast', 'lunch', 'snacks', 'dinner']
	const animatedHeights = useRef(mealKeys.map(() => new Animated.Value(screenHeight * 0.3))).current

	useEffect(() => {
		loadSavedFile()
	}, [])

	useEffect(() => {
		if (filePicked && todayMenu) setTimeout(() => scrollToCurrentMeal(), 200)
	}, [filePicked, todayMenu])

	useEffect(() => {
		if (!todayMenu) return
		mealKeys.forEach((mealKey, index) => {
			const itemCount = todayMenu[mealKey]?.length || 1
			const targetHeight = Math.max(itemCount * 26 + 120, screenHeight * 0.25)
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

	function scrollToCurrentMeal() {
		const index = getCurrentMealIndex()
		if (scrollRef.current) scrollRef.current.scrollTo({ x: index * screenWidth, animated: true })
	}

	async function loadSavedFile() {
		try {
			const savedUri = await AsyncStorage.getItem('mess_menu_file_uri')
			if (savedUri) {
				await parseExcelFile(savedUri)
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
			await parseExcelFile(file.uri)
			setFilePicked(true)
		} catch (err) {
			console.error('❌ Error picking file:', err)
			ToastAndroid.show('Failed to parse Excel file', ToastAndroid.SHORT)
			setLoading(false)
		}
	}

	async function parseExcelFile(fileUri) {
		try {
			const base64 = await FileSystem.readAsStringAsync(fileUri, {
				encoding: FileSystem.EncodingType.Base64,
			})
			const binary = Buffer.from(base64, 'base64')
			const workbook = XLSX.read(binary, { type: 'buffer' })

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

			// Extract a title that contains the word "menu" (case-insensitive)
			const extractedTitle =
				Object.values(mainSheet)
					.map((c) => (c?.v && typeof c.v === 'string' ? c.v.trim() : ''))
					.find((text) => /menu/i.test(text)) || 'Mess Menu'

			const today = new Date()
			const dayNum = today.getDate()
			const currentDate = dayNum.toString().padStart(2, '0')

			let startIndex = dates.findIndex((v) => new RegExp(`\\b${currentDate}\\b`).test(v))
			if (startIndex === -1) throw new Error(`No menu found for today (${currentDate})`)

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
				day: dates[startIndex],
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
			<Text
				style={{
					fontSize: 18,
					padding: 10,
					fontWeight: '600',
					color: colorTheme.accent.primary,
					textAlign: 'center',
				}}
			>
				{title}
			</Text>

			<Text
				style={{
					fontSize: 15,
					fontWeight: '500',
					color: colorTheme.main.text,
					textAlign: 'center',
					marginBottom: 20,
					opacity: 0.8,
				}}
			>
				{todayMenu.day}
			</Text>

			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator
				ref={scrollRef}
				style={{ paddingVertical: 0 }}
			>
				{mealKeys.map((mealKey, i) => (
					<Animated.View
						key={mealKey}
						style={{
							width: screenWidth - 50,
							marginHorizontal: 25,
							backgroundColor: colorTheme.main.secondary,
							borderColor: colorTheme.main.tertiary,
							borderWidth: 1.8,
							borderRadius: 18,
							padding: 20,
							elevation: 6,
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
							contentContainerStyle={{ paddingBottom: 10 }}
							showsVerticalScrollIndicator={false}
						>
							{todayMenu[mealKey].length ? (
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
					</Animated.View>
				))}
			</ScrollView>

			<Pressable
				onPress={resetFile}
				style={{
					marginTop: 30,
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
