import { Text, View, StyleSheet, Alert } from 'react-native'
import ColorTheme from '../components/settings/ColorTheme'
import SemSelection from '../components/settings/SemSelection'
import VersionInfo from '../components/settings/VersionInfo'
import { ScrollView } from 'react-native-gesture-handler'
import General from '../components/settings/General'

export default function Settings() {
	return (
		<ScrollView nestedScrollEnabled>
			<View style={[{ marginTop: 20 }]}>
				<SemSelection title="Default Semester" />
				<General />
				<VersionInfo />
			</View>
		</ScrollView>
	)
}
