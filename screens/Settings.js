import { Text, View, StyleSheet, Alert } from 'react-native'
import ColorTheme from '../components/settings/ColorTheme'
import SemSelection from '../components/settings/SemSelection'
import VersionInfo from '../components/settings/VersionInfo'

export default function Settings() {
	return (
		<View style={[{ marginTop: 20 }]}>
			<SemSelection title="Default Semester" />
			<ColorTheme />
			<VersionInfo />
		</View>
	)
}
