import { useContext, useState, useEffect } from 'react'
import { Text, View, StyleSheet, Alert } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { ColorThemeContext } from '../context/ColorThemeContext'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ForceUpdateContext } from '../context/ForceUpdateContext'

export default function SemDropDown({ semData, handleSemChange, defaultSem, ...props }) {
	const { colorTheme } = useContext(ColorThemeContext)
	const { trigger } = useContext(ForceUpdateContext)
	const [dropDown, setDropDown] = useState(false)
	const [filteredSemData, setFilteredSemData] = useState(null)
	const [sem, setSem] = useState(defaultSem ?? null)
	const [prevSem, setPrevSem] = useState(defaultSem ?? null)

	useEffect(() => {
		async function getSemData() {
			console.log(sem)
			filterSemData(semData)
		}
		getSemData()
	}, [trigger])

	useEffect(() => {
		if (defaultSem && sem !== defaultSem) {
			setSem(defaultSem)
			setPrevSem(defaultSem)
		}
	}, [defaultSem])

	function filterSemData(data) {
		const arr = data.map((item) => ({
			label: item.sem,
			value: item.semID,
		}))
		console.log(arr)
		setFilteredSemData(arr)
		if (!sem && defaultSem) {
			setSem(defaultSem)
		}
	}

	function callHandleSemChange(newSem) {
		if (prevSem === newSem) return
		handleSemChange(prevSem, newSem)
		setPrevSem(newSem)
	}

	const styles = StyleSheet.create({
		container: { padding: 20, paddingVertical: 0, width: '100%' },
		heading: {
			color: colorTheme.main.text,
			fontSize: 24,
			fontWeight: 'bold',
			marginBottom: 20,
		},
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
			<Text style={styles.heading}>Select Semester</Text>
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
					onChangeValue={callHandleSemChange}
				/>
			</View>
		</View>
	)
}
