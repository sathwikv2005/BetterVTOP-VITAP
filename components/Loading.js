import { ActivityIndicator, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { useContext } from 'react'

export default function Loading() {
	const { colorTheme } = useContext(ColorThemeContext)
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size={36} color={colorTheme.accent.primary} />
		</View>
	)
}
