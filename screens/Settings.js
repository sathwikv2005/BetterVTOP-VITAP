import { Text, View, StyleSheet, Alert } from 'react-native'
import ColorTheme from '../components/settings/ColorTheme'
import SemSelection from '../components/settings/SemSelection'
import VersionInfo from '../components/settings/VersionInfo'
import { ScrollView } from 'react-native-gesture-handler'
import General from '../components/settings/General'
import { useRef } from 'react'
import CustomThemeCreator from '../components/settings/CustomThemeCreator'

export default function Settings() {
	const sheetRef = useRef(null)
	const openSheet = () => {
		sheetRef.current?.open()
	}
	return (
		<ScrollView nestedScrollEnabled>
			<View style={[{ marginTop: 20 }]}>
				<SemSelection title="Default Semester" />
				<General openSheet={openSheet} />
				<VersionInfo />
			</View>
			<CustomThemeCreator ref={sheetRef} />
		</ScrollView>
	)
}
