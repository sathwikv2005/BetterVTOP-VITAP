import Constants from 'expo-constants'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { ToastAndroid } from 'react-native'

import { Linking } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import { useContext } from 'react'

const version = Constants.expoConfig.version
const buildNumber = Constants.expoConfig.android?.versionCode

console.log('Version:', version)
console.log('Build:', buildNumber)

export default function VersionInfo() {
	var count = 0
	const { colorTheme } = useContext(ColorThemeContext)

	const handleVersionPress = () => {
		count = count + 1
		console.log(count)
		ToastAndroid.show(`Version number: ${version}`, ToastAndroid.SHORT)
	}

	const handleGithubPress = () => {
		Linking.openURL('https://github.com/sathwikv2005/BetterVTOP-VITAP')
		// Linking.openURL('https://github.com/sathwikv2005')
	}

	const styles = StyleSheet.create({
		container: { padding: 20, paddingVertical: 0, width: '100%', marginTop: 20 },
		heading: { color: colorTheme.main.text, fontSize: 24, fontWeight: 'bold', marginBottom: 0 },
		text: {
			color: colorTheme.main.text,
		},
		label: { color: colorTheme.accent.primary, fontSize: 18 },
		box: {
			flexDirection: 'column',
			width: '100%',
			padding: 10,
			paddingHorizontal: 20,
		},
		headingBox: {
			flexDirection: 'row',
			gap: 7,
		},
		versionBox: {
			gap: 0,
		},
		githubBox: {
			marginTop: 25,
			flexDirection: 'row',
			gap: 5,
			alignItems: 'center',
		},
		sub: {
			marginTop: 4,
		},
		icon: {
			marginTop: 6,
		},
		border: {
			width: '100%',
			paddingVertical: 10,
			borderBottomColor: colorTheme.main.text,
			borderBottomWidth: 1,
		},
	})

	return (
		<View style={styles.container}>
			<View style={[styles.headingBox]}>
				<AntDesign
					name="infocirlceo"
					style={[styles.icon]}
					size={24}
					color={colorTheme.accent.primary}
				/>
				<Text style={styles.heading}>App info</Text>
			</View>
			<View style={[styles.box]}>
				<Pressable onPress={handleVersionPress} style={[styles.versionBox, styles.border]}>
					<Text style={[styles.label]}>App Version</Text>
					<Text style={[styles.text, styles.sub, { marginLeft: 10 }]}>{version}</Text>
				</Pressable>

				<Pressable onPress={handleGithubPress} style={[styles.githubBox, styles.border]}>
					<Feather
						name="github"
						style={[styles.icon, { marginTop: 0 }]}
						size={24}
						color={colorTheme.accent.primary}
					/>
					<Text style={[styles.text, styles.label]}>GitHub</Text>
				</Pressable>
			</View>
		</View>
	)
}
