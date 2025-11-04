// SpeedTest.js
import React, { useContext, useState } from 'react'
import * as FileSystem from 'expo-file-system'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import Svg, { Path, Text as SvgText } from 'react-native-svg'
import DropDownPicker from 'react-native-dropdown-picker'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ColorThemeContext } from '../context/ColorThemeContext'
import Loading from '../components/Loading'

export default function SpeedTest() {
	const { colorTheme } = useContext(ColorThemeContext)

	const [ping, setPing] = useState(null)
	const [pingTesting, setPingTesting] = useState(false)
	const [progress, setProgress] = useState(0)

	const [speed, setSpeed] = useState(0)
	const [isTesting, setIsTesting] = useState(false)

	const [serverOpen, setServerOpen] = useState(false)
	const [selectedServer, setSelectedServer] = useState('cloudflare')

	const servers = [
		{
			label: 'Cloudflare (recommended)',
			value: 'cloudflare',
			url: 'https://speed.cloudflare.com/__down?bytes=10485760',
		},
		{
			label: 'OVH',
			value: 'ovh',
			url: 'https://proof.ovh.net/files/1Gb.dat',
		},
	]

	const maxSpeed = 100 // max Mbps for UI
	const radius = 100
	const circumference = Math.PI * radius
	const percentage = Math.min(speed / maxSpeed, 1)
	const strokeDashoffset = circumference * (1 - percentage)

	const labels = []
	for (let i = 0; i <= maxSpeed; i += 10) {
		const angle = Math.PI * (i / maxSpeed)
		const x = Math.cos(angle - Math.PI) * (radius + 20)
		const y = Math.sin(angle - Math.PI) * (radius + 20)
		labels.push({ value: i, x, y })
	}

	const startPingTest = async () => {
		setPingTesting(true)
		const pingServer = 'https://1.1.1.1/cdn-cgi/trace'
		const pingCount = 5
		let totalPing = 0

		for (let i = 0; i < pingCount; i++) {
			const start = Date.now()
			try {
				await fetch(pingServer, { method: 'HEAD' })
				const duration = Date.now() - start
				totalPing += duration
			} catch (err) {
				console.warn('Ping failed', err)
			}
		}

		setPing(Math.round(totalPing / pingCount))
		setPingTesting(false)
	}

	// Speed test function
	const startSpeedTest = async () => {
		setIsTesting(true)
		setProgress(0)
		setSpeed(0)

		const server = servers.find((s) => s.value === selectedServer)
		if (!server) return

		const downloadUrl = server.url // 1GB test file
		const filePath = FileSystem.cacheDirectory + 'speedtest.tmp'
		const startTime = Date.now()

		const downloadResumable = FileSystem.createDownloadResumable(
			downloadUrl,
			filePath,
			{},
			(downloadProgress) => {
				const written = downloadProgress.totalBytesWritten
				const total = downloadProgress.totalBytesExpectedToWrite
				const progress = written / total
				setProgress(progress)

				const duration = (Date.now() - startTime) / 1000 // seconds
				const mbps = (written * 8) / (duration * 1_000_000)
				setSpeed(mbps)
			}
		)

		// Start the download
		downloadResumable.downloadAsync().catch(() => {})

		// Stop after 10 seconds
		setTimeout(async () => {
			await downloadResumable.pauseAsync() // stop download
			await FileSystem.deleteAsync(filePath, { idempotent: true }) //delete the download data
			setIsTesting(false)
		}, 10000)
	}

	const getSpeedEmoji = (speed) => {
		if (speed === 0) return null
		if (speed < 2) return '💀' // less than 2 Mbps
		if (speed < 5) return '😭' // less than 5 Mbps
		if (speed < 10) return '😢' // less than 10 Mbps
		if (speed < 25) return '🙂' // 10-25 Mbps
		if (speed < 50) return '😎' // 25-50 Mbps
		if (speed < 100) return '🔥' // 50-100 Mbps
		return '🚀' // 100+ Mbps
	}

	const startSpeedTestWithPing = async () => {
		setPing(null)
		await startPingTest()
		startSpeedTest() // your existing download speed test
	}

	const styles = StyleSheet.create({
		container: {
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colorTheme.main.background,
			padding: 20,
			marginTop: '5%',
		},
		title: {
			fontSize: 20,
			fontWeight: '700',
			marginBottom: 10,
			color: colorTheme.main.text,
		},
		dropdownContainer: {
			// width: '90%',
			backgroundColor: colorTheme.main.secondary,
			borderColor: colorTheme.accent.tertiary,
			zIndex: serverOpen ? 1000 : 0,
			marginBottom: 0,
		},
		dropDownBox: {
			backgroundColor: colorTheme.main.secondary,
			borderColor: colorTheme.accent.tertiary,
		},
		pickerText: { color: colorTheme.main.text },
		speedText: {
			fontSize: 36,
			fontWeight: 'bold',
			marginTop: 0,
			color: colorTheme.accent.primary,
		},
		button: {
			marginTop: 10,
			backgroundColor: colorTheme.accent.primary,
			paddingVertical: 12,
			paddingHorizontal: 40,
			borderRadius: 10,
		},
		buttonText: {
			color: colorTheme.main.primary,
			fontWeight: '700',
			fontSize: 18,
		},
	})

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Select Server</Text>

			<DropDownPicker
				open={serverOpen}
				value={selectedServer}
				items={servers}
				setOpen={setServerOpen}
				setValue={setSelectedServer}
				dropDownDirection="AUTO"
				dropDownContainerStyle={styles.dropDownBox}
				style={styles.dropdownContainer}
				textStyle={styles.pickerText}
				labelStyle={styles.pickerText}
				ArrowDownIconComponent={({ style }) => (
					<Icon name="arrow-drop-down" size={24} color={colorTheme.main.text} style={style} />
				)}
				ArrowUpIconComponent={({ style }) => (
					<Icon name="arrow-drop-up" size={24} color={colorTheme.main.text} style={style} />
				)}
			/>
			<Svg
				style={{ maxWidth: 400 }}
				height="250"
				width="90%"
				viewBox={`${-radius - 40} ${-radius - 40} ${radius * 2 + 80} ${radius + 80}`}
			>
				<Path
					d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
					stroke={colorTheme.main.tertiary}
					strokeWidth={20}
					fill="none"
				/>
				<Path
					d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
					stroke={colorTheme.accent.primary}
					strokeWidth={20}
					fill="none"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
				/>
				{labels.map((label, idx) => (
					<SvgText
						key={idx}
						x={label.x}
						y={label.y}
						fill={colorTheme.main.text}
						fontSize="12"
						fontWeight="bold"
						textAnchor="middle"
						alignmentBaseline="middle"
					>
						{label.value}
					</SvgText>
				))}
			</Svg>

			<Text style={styles.speedText}>
				{speed.toFixed(1)} Mbps {getSpeedEmoji(speed)}
			</Text>

			{ping && <Text style={[styles.title, { marginBottom: 5 }]}>Ping: {ping} ms</Text>}
			{pingTesting && (
				<View style={{ marginTop: 1, height: 50 }}>
					<Loading />
				</View>
			)}

			<TouchableOpacity style={styles.button} onPress={startSpeedTestWithPing} disabled={isTesting}>
				{isTesting || pingTesting ? (
					<ActivityIndicator size="small" color={colorTheme.main.primary} />
				) : (
					<Text style={styles.buttonText}>Start Test</Text>
				)}
			</TouchableOpacity>
		</View>
	)
}
