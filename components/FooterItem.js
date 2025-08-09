import { Text, View, Pressable } from 'react-native'
import { useContext } from 'react'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { goToDrawerTab } from '../util/goToDrawerTab'
import facts from '../vitap_facts.json'

export default function FooterItem({ lastUpdated, style, savedSem, ...props }) {
	const { colorTheme } = useContext(ColorThemeContext)
	let selectedFact = null
	if (!selectedFact) {
		selectedFact = facts[Math.floor(Math.random() * facts.length)]
	}

	return (
		<View style={{ marginVertical: 20, marginBottom: 50, alignItems: 'center' }}>
			<Text style={style}>Last updated on {lastUpdated}.</Text>
			<Text style={style}>Semester: {savedSem ? savedSem.sem : ''}</Text>
			<Pressable
				onPress={() => goToDrawerTab('settings')}
				style={{
					width: '100%',
					borderBottomColor: colorTheme.main.tertiary,
					borderBottomWidth: 0,
					paddingBottom: 10,
				}}
			>
				<Text style={[style, { color: colorTheme.accent.secondary }]}>change semester</Text>
			</Pressable>

			<View style={{ marginTop: 15, paddingHorizontal: 15 }}>
				<View
					style={[
						style,
						{
							fontStyle: 'italic',
							textAlign: 'center',
							flexDirection: 'column',
							justifyContent: 'center',
						},
					]}
				>
					<Text style={{ textAlign: 'center', color: colorTheme.accent.secondary, opacity: 1 }}>
						💡 {selectedFact.header}
					</Text>
					<Text
						style={{ color: colorTheme.main.text, textAlign: 'center', opacity: 0.8, fontSize: 13 }}
					>
						{selectedFact.body}
					</Text>
					<Text
						style={{ color: colorTheme.main.text, textAlign: 'center', opacity: 0.7, fontSize: 12 }}
					>
						{selectedFact.footer}
					</Text>
				</View>
			</View>
		</View>
	)
}
