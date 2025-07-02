import { Text, View, StyleSheet, Alert } from 'react-native'
import ColorTheme from '../components/ColorTheme'
import SemSelection from '../components/SemSelection'

export default function Settings() {
	return (
		<View>
			<SemSelection />
			<ColorTheme />
		</View>
	)
}
