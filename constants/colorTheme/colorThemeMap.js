import AsyncStorage from '@react-native-async-storage/async-storage'

import { blackColors } from './accent/black'
import { blueColors } from './accent/blue'
import { greenColors } from './accent/green'
import { redColors } from './accent/red'
import { whiteColors } from './accent/white'
import { yellowColors } from './accent/yellow'
import { darkColors } from './main/dark'
import { lightColors } from './main/light'

const defaultMain = 'dark'
const defaultAccent = 'blue'

export const colorThemeMap = {
	main: {
		dark: darkColors,
		light: lightColors,
	},
	accent: {
		black: blackColors,
		blue: blueColors,
		green: greenColors,
		red: redColors,
		white: whiteColors,
		yellow: yellowColors,
	},
}

export async function getColorTheme() {
	let customTheme = await AsyncStorage.getItem('custom-theme')
	if (customTheme) return JSON.parse(customTheme)
	let colorTheme = await AsyncStorage.getItem('colorTheme')
	if (!colorTheme) {
		colorTheme = {
			main: defaultMain,
			accent: defaultAccent,
		}
	} else {
		colorTheme = JSON.parse(colorTheme)
	}
	if (!colorTheme.main) colorTheme.main = defaultMain
	if (!colorTheme.accent) colorTheme.accent = defaultAccent

	return {
		main: colorThemeMap.main[colorTheme.main],
		accent: colorThemeMap.accent[colorTheme.accent],
	}
}

export function getNewColorTheme(colorTheme) {
	if (!colorTheme.main) colorTheme.main = defaultMain
	if (!colorTheme.accent) colorTheme.accent = defaultAccent
	return {
		main: colorThemeMap.main[colorTheme.main],
		accent: colorThemeMap.accent[colorTheme.accent],
	}
}
