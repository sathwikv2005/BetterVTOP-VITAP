import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Alert, FlatList, Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { ForceUpdateContext } from '../context/ForceUpdateContext'
import SemDropDown from '../components/SemDropDown'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Loading from '../components/Loading'
import { getMarks } from '../util/VTOP/marks'
import MarksDetails from '../components/MarksDetails'
import MarksItem from '../components/MarksItem'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function Marks() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [loading, setLoading] = useState(true)
	const { trigger } = useContext(ForceUpdateContext)
	const [sem, setSem] = useState(null)
	const [semData, setSemData] = useState(null)
	const [refreshing, setRefreshing] = useState(false)
	const [marks, setMarks] = useState(null)

	useEffect(() => {
		async function getSemData() {
			setLoading(true)
			const [[, semStr], [, semDataStr]] = await AsyncStorage.multiGet(['sem', 'semData'])
			if (!semDataStr || !semStr) {
				setLoading(false)
				return goToDrawerTab('login')
			}
			const savedSem = JSON.parse(semStr)
			const savedSemData = JSON.parse(semDataStr)
			setSemData(savedSemData.semData)
			setLoading(false)
		}
		getSemData()
	}, [trigger])

	const onRefresh = useCallback(async () => {
		if (!sem) {
			ToastAndroid.show('Please select a semester first', ToastAndroid.SHORT)
			setRefreshing(false)
			return
		}
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		setRefreshing(true)

		const data = await getMarks(setRefreshing, sem)
		if (data.error) {
			console.log(data.error)
			setRefreshing(false)
			return Alert.alert('Failed to login, please try again.')
		}

		setMarks(data.marksData)

		setRefreshing(false)
		ToastAndroid.show('Data refreshed', ToastAndroid.SHORT)
	}, [sem])

	async function handleSemChange(prevSem, newSem) {
		setSem(newSem)
		setLoading(true)
		const marksStr = await AsyncStorage.getItem(`marks-${newSem}`)
		if (!marksStr) {
			const marksData = await getMarks(setLoading, newSem)
			if (marksData.error) {
				setLoading(false)
				return Alert.alert(
					'Failed to get marks data!',
					'Failed to get data from vtop, please try again later.'
				)
			}
			setMarks(marksData.marksData)
			setLoading(false)
			return
		}
		const marksData = JSON.parse(marksStr).marksData
		setMarks(marksData)
		setLoading(false)
	}

	return loading ? (
		<Loading />
	) : (
		<View style={[{ flex: 1, marginTop: 20 }]}>
			<SemDropDown semData={semData} defaultSem={sem} handleSemChange={handleSemChange} />
			<MarksTable
				marks={marks}
				colorTheme={colorTheme}
				onRefresh={onRefresh}
				refreshing={refreshing}
			/>
		</View>
	)
}

function MarksTable({ marks, colorTheme, refreshing, onRefresh, ...props }) {
	const insets = useSafeAreaInsets()

	const [selected, setSelected] = useState(null)

	const sheetRef = useRef(null)

	const openSheet = async (item) => {
		const target = marks.find((x) => x.classNbr === item.classNbr)
		if (!target) return

		setSelected(target)
		sheetRef.current?.open()
	}

	const styles = StyleSheet.create({
		list: {
			marginTop: '1%',
			width: '100%',
			paddingBottom: '15%',
			flexDirection: 'column',
			alignContent: 'center',
			alignSelf: 'center',
		},
		emptyTitle: {
			color: colorTheme.main.text,
			fontSize: 18,
			fontWeight: '600',
			textAlign: 'center',
			marginBottom: 6,
		},
		emptySub: {
			color: colorTheme.main.tertiary,
			fontSize: 15,
			textAlign: 'center',
		},
		lastUpdated: {
			color: colorTheme.main.tertiary,
			alignSelf: 'center',
			// top: -25,
		},
		mainText: {
			marginTop: 15,
			justifyContent: 'center',
			color: colorTheme.main.text,
		},
	})

	return (
		<View>
			<FlatList
				style={{ backgroundColor: colorTheme.main.primary }}
				contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 130 }]}
				data={marks}
				keyExtractor={(item) => item.classNbr}
				renderItem={({ item }) => {
					return (
						<Pressable onPress={() => openSheet(item)}>
							<MarksItem item={item} />
						</Pressable>
					)
				}}
				refreshing={refreshing}
				onRefresh={onRefresh}
				ListEmptyComponent={
					<View style={{ alignItems: 'center', marginTop: 50, paddingHorizontal: 20 }}>
						<FontAwesome
							name="info-circle"
							size={40}
							color={colorTheme.accent.primary}
							style={{ marginBottom: 10 }}
						/>
						<Text style={[styles.emptyTitle]}>No Data Available</Text>
						<Text style={[styles.emptySub]}>Please select a semester to view marks.</Text>
					</View>
				}
			/>
			<MarksDetails ref={sheetRef} data={selected} colorTheme={colorTheme} />
		</View>
	)
}
