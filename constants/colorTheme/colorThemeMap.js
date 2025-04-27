import AsyncStorage from '@react-native-async-storage/async-storage'

import { blackColors } from './accent/black'
import { blueColors } from './accent/blue'
import { greenColors } from './accent/green'
import { redColors } from './accent/red'
import { whiteColors } from './accent/white'
import { yellowColors } from './accent/yellow'
import { darkColors } from './main/dark'
import { lightColors } from './main/light'

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
	let colorTheme = await AsyncStorage.getItem('colorTheme')
	if (!colorTheme) {
		colorTheme = {
			main: 'dark',
			accent: 'red',
		}
	} else {
		colorTheme = JSON.parse(colorTheme)
	}
	if (!colorTheme.main) colorTheme.main = 'dark'
	if (!colorTheme.accent) colorTheme.accent = 'red'

	return {
		main: colorThemeMap.main[colorTheme.main],
		accent: colorThemeMap.accent[colorTheme.accent],
	}
}

export function getNewColorTheme(colorTheme) {
	if (!colorTheme.main) colorTheme.main = 'dark'
	if (!colorTheme.accent) colorTheme.accent = 'red'
	return {
		main: colorThemeMap.main[colorTheme.main],
		accent: colorThemeMap.accent[colorTheme.accent],
	}
}
