import { useContext, useState, useEffect } from 'react'
import { goToDrawerTab } from '../../util/goToDrawerTab'
import { Text, View, StyleSheet, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DropDownPicker from 'react-native-dropdown-picker'
import { ColorThemeContext } from '../../context/ColorThemeContext'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ForceUpdateContext } from '../../context/ForceUpdateContext'
import { useAlert } from 'custom-react-native-alert'

export default function SemSelection({ title, ...props }) {
	const { showAlert } = useAlert()
	const { colorTheme } = useContext(ColorThemeContext)
	const { trigger } = useContext(ForceUpdateContext)
	const [dropDown, setDropDown] = useState(false)
	const [filteredSemData, setFilteredSemData] = useState(null)

	const [sem, setSem] = useState(null)
	const [prevSem, setPrevSem] = useState(null)
	const [semData, setSemData] = useState(null)

	useEffect(() => {
		async function getSemData() {
			const [[, semStr], [, semDataStr]] = await AsyncStorage.multiGet(['sem', 'semData'])
			if (!semDataStr || !semStr) return goToDrawerTab('login')
			const savedSem = JSON.parse(semStr)
			const savedSemData = JSON.parse(semDataStr)
			setSem(savedSem.semID)
			setPrevSem(savedSem.semID)
			setSemData(savedSemData.semData)
			filterSemData(savedSemData.semData)
		}
		getSemData()
	}, [trigger])

	async function handleSemChange(newSemID) {
		if (prevSem === newSemID) return
		setPrevSem(sem)
		const target = semData.find((x) => x.semID === newSemID)
		await AsyncStorage.setItem('sem', JSON.stringify(target))
		setSem(newSemID)
		showAlert({
			title: '✅ Semester Updated',
			message:
				'Your default semester has been changed.\nPlease refresh the home page to fetch the latest data from VTOP.',
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

	function filterSemData(data) {
		const arr = data.map((item) => ({
			label: item.sem,
			value: item.semID,
		}))

		setFilteredSemData(arr)
	}

	const styles = StyleSheet.create({
		container: { padding: 20, paddingVertical: 0, width: '100%' },
		heading: { color: colorTheme.main.text, fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
		setting: {
			width: '95%',
			flexDirection: 'row',
			alignItems: 'center',
			marginBottom: 20,
			justifyContent: 'space-between',
		},
		// label: { color: colorTheme.main.text, fontSize: 18, width: '35%' },
		picker: {
			width: '100%',
			zIndex: 100,
			backgroundColor: colorTheme.main.primary,
			borderColor: colorTheme.accent.tertiary,
			zIndex: 100,
		},
		dropDownBox: {
			backgroundColor: colorTheme.main.secondary,
			borderColor: colorTheme.accent.tertiary,
			width: '100%',
		},
	})

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>{title}</Text>
			<View style={styles.setting}>
				<DropDownPicker
					dropDownDirection="AUTO"
					dropDownContainerStyle={styles.dropDownBox}
					style={styles.picker}
					textStyle={{ color: colorTheme.main.text }}
					labelStyle={{ color: colorTheme.main.text }}
					open={dropDown}
					value={sem}
					ArrowDownIconComponent={({ style }) => (
						<Icon name="arrow-drop-down" size={24} color={colorTheme.main.text} style={style} />
					)}
					ArrowUpIconComponent={({ style }) => (
						<Icon name="arrow-drop-up" size={24} color={colorTheme.main.text} style={style} />
					)}
					items={filteredSemData || []}
					setOpen={setDropDown}
					setValue={setSem}
					onChangeValue={handleSemChange}
				/>
			</View>
		</View>
	)
}
