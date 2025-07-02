import { Text, View, Pressable } from 'react-native'
import { useContext } from 'react'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { goToDrawerTab } from '../util/goToDrawerTab'

export default function FooterItem({ lastUpdated, style, savedSem, ...props }) {
	const { colorTheme } = useContext(ColorThemeContext)

	return (
		<View style={{ marginVertical: 20, marginBottom: 50, alignItems: 'center' }}>
			<Text style={style}>Last updated on {lastUpdated}</Text>
			<Text style={style}>{savedSem ? savedSem.sem : ''}</Text>
			<Pressable onPress={() => goToDrawerTab('settings')}>
				<Text style={[style, { color: colorTheme.accent.secondary }]}>change semister</Text>
			</Pressable>
		</View>
	)
}
