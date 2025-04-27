import React, { createContext, useState, useEffect } from 'react'
import { getColorTheme } from '../constants/colorTheme/colorThemeMap'
import { View, ActivityIndicator } from 'react-native'

export const ColorThemeContext = createContext()

export const ColorThemeProvider = ({ children }) => {
	const [colorTheme, setColorTheme] = useState(null)

	useEffect(() => {
		async function fetchColorTheme() {
			try {
				const theme = await getColorTheme()
				if (theme) {
					setColorTheme(theme)
				} else {
					console.log('Theme not found')
				}
			} catch (error) {
				console.error('Error fetching color theme', error)
			}
		}
		fetchColorTheme()
	}, [])

	if (!colorTheme) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		)
	}

	return <ColorThemeContext.Provider value={colorTheme}>{children}</ColorThemeContext.Provider>
}
