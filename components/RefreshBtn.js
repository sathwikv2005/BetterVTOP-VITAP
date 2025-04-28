import { useContext, useLayoutEffect } from 'react'
import { ColorThemeContext } from '../context/ColorThemeContext'
import { Pressable, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function RefreshBtn({ btnStyle, onPress, ...props }) {
	const { colorTheme } = useContext(ColorThemeContext)
	return (
		<View
			style={[
				{
					backgroundColor: colorTheme.accent.primary,
					alignItems: 'center',
					justifyContent: 'center',
					padding: 8,
					borderRadius: 8,
					marginRight: 10,
					width: 40,
					overflow: 'hidden',
				},
				btnStyle,
			]}
		>
			<Pressable
				onPress={onPress}
				style={({ pressed }) => ({
					opacity: pressed ? 0.5 : 1,
				})}
				android_ripple={{
					color: colorTheme.accent.primary,
					borderless: false,
				}}
			>
				<FontAwesome name="refresh" size={24} color={colorTheme.main.primary} />
			</Pressable>
		</View>
	)
}
