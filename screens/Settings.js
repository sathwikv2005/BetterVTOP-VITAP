import { Text, View, StyleSheet, Alert } from 'react-native'
import ColorTheme from '../components/ColorTheme'
import SemSelection from '../components/SemSelection'
import VersionInfo from '../components/VersionInfo'

export default function Settings() {
	return (
		<View style={[{ marginTop: 20 }]}>
			<SemSelection />
			<ColorTheme />
			<VersionInfo />
		</View>
	)
}
