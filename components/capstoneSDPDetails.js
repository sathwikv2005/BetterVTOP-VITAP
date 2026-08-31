import { forwardRef, useState } from 'react'
import { Text, StyleSheet, View, Pressable, Dimensions, Switch } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { ScrollView } from 'react-native-gesture-handler'
import Entypo from '@expo/vector-icons/Entypo'
import Foundation from '@expo/vector-icons/Foundation'

const { height } = Dimensions.get('window')

const CapstoneSDPDetails = forwardRef(({ capstoneSDP, colorTheme, minPercent }, ref) => {
	const isEmpty = !capstoneSDP
	const [showAllDays, setShowAllDays] = useState(false)

	const percentageGreen = parseInt(capstoneSDP?.percentage ?? 0) >= parseInt(minPercent ?? 0)

	const styles = StyleSheet.create({
		content: {
			width: '100%',
			alignSelf: 'center',
			paddingVertical: 10,
		},

		container: {
			width: '90%',
			alignSelf: 'center',
		},

		titleBox: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 5,
			marginTop: 10,
			marginBottom: 15,
		},

		icon: {
			fontSize: 24,
		},

		title: {
			fontSize: 18,
			fontWeight: '600',
			color: colorTheme.accent.primary,
			textAlign: 'center',
		},

		text: {
			color: colorTheme.main.text,
			fontSize: 12,
			fontWeight: '400',
		},

		label: {
			fontSize: 14,
			fontWeight: '500',
			color: colorTheme.accent.secondary,
		},

		row: {
			flexDirection: 'row',
			marginBottom: 5,
		},

		summary: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginBottom: 5,
		},

		summaryBox: {
			flexDirection: 'column',
		},

		percentageDetails: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginTop: 5,
		},

		green: {
			color: '#01BD39FF',
		},

		red: {
			color: '#FF0000FF',
		},

		percentage: {
			fontSize: 16,
			fontWeight: '500',
		},

		logHeaderContainer: {
			flexDirection: 'row',
			justifyContent: 'flex-end',
			alignItems: 'center',
			width: '90%',
			alignSelf: 'center',
			marginBottom: 8,
			gap: 8,
		},

		toggleText: {
			color: colorTheme.main.text,
			fontSize: 13,
			fontWeight: '500',
		},

		logRow: {
			flexDirection: 'row',
			justifyContent: 'center',
			borderBottomWidth: 1,
			borderBottomColor: colorTheme.accent.tertiary,
		},

		logHeader: {
			backgroundColor: colorTheme.accent.tertiary,
			borderBottomWidth: 2,
			borderBottomColor: colorTheme.accent.primary,
		},

		logCell: {
			paddingVertical: 10,
			paddingHorizontal: 6,
			fontSize: 13,
			color: colorTheme.main.text,
			textAlignVertical: 'center',
			textAlign: 'center',
			borderRightWidth: 1,
			borderRightColor: colorTheme.accent.tertiary,
			justifyContent: 'center',
		},

		dateCell: {
			width: '27%',
		},

		dayTypeCell: {
			width: '28%',
		},

		statusCell: {
			width: '22%',
		},

		punchCell: {
			width: '23%',
			borderRightWidth: 0,
		},

		headerText: {
			fontWeight: '600',
			color: colorTheme.accent.primary,
		},

		status: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 4,
		},

		holiday: {
			color: colorTheme.main.tertiary,
		},
	})

	const renderRow = (label, value) => (
		<View style={styles.row}>
			<Text style={styles.label}>{label}: </Text>
			<Text style={[styles.text, { marginTop: 2 }]}>{value}</Text>
		</View>
	)

	const renderPercentageRow = (label, value, green) => (
		<View style={styles.row}>
			<Text style={styles.label}>{label}: </Text>
			<Text style={[styles.text, styles.percentage, green ? styles.green : styles.red]}>
				{value}
			</Text>
		</View>
	)

	const logs = capstoneSDP?.logs ?? []

	const filteredLogs = showAllDays
		? logs
		: logs.filter((entry) => entry.dayType !== 'Holiday' && entry.dayType !== 'No Instructional')

	return (
		<Modalize
			ref={ref}
			snapPoint={height * 0.6}
			scrollViewProps={{
				showsVerticalScrollIndicator: false,
				keyboardShouldPersistTaps: 'handled',
				nestedScrollEnabled: true,
			}}
			handleStyle={{
				backgroundColor: percentageGreen ? '#48FF00FF' : '#DA2C00FF',
			}}
			modalStyle={{
				backgroundColor: colorTheme.main.secondary,
				borderTopColor: percentageGreen ? '#48FF00FF' : '#DA2C00FF',
				borderTopWidth: 3,
				elevation: 5,
			}}
		>
			{isEmpty ? (
				<Text
					style={{
						textAlign: 'center',
						padding: 20,
						color: colorTheme.main.text,
					}}
				>
					No data
				</Text>
			) : (
				<ScrollView contentContainerStyle={styles.content}>
					<View style={styles.container}>
						{/* Title */}
						<View style={styles.titleBox}>
							<Foundation
								name="clipboard-notes"
								style={styles.icon}
								color={colorTheme.accent.primary}
							/>
							<Text style={styles.title}>{capstoneSDP.title || 'Capstone/SDP'}</Text>
						</View>

						{/* Summary */}
						<View style={styles.summary}>
							<View style={styles.summaryBox}>
								{renderRow(
									'Present',
									`${capstoneSDP.present}/${capstoneSDP.present + capstoneSDP.absent}`,
								)}

								{renderRow('Absent', capstoneSDP.absent)}
							</View>

							<View style={styles.summaryBox}>
								{renderRow('On Duty', capstoneSDP.onduty)}

								{renderRow(
									'Total',
									capstoneSDP.logs?.filter((x) =>
										['Present', 'On Duty', 'Absent'].includes(x.status),
									).length ?? 0,
								)}
							</View>
						</View>

						{/* Percentage */}
						<View style={styles.percentageDetails}>
							{renderPercentageRow('Percentage', `${capstoneSDP.percentage}%`, percentageGreen)}
						</View>
					</View>

					{/* Log */}
					<View
						style={{
							marginTop: 20,
							width: '100%',
							maxHeight: height * 0.64,
						}}
					>
						{/* Show All Days Toggle */}
						<View style={styles.logHeaderContainer}>
							<Text style={styles.toggleText}>Show all days</Text>

							<Switch
								value={showAllDays}
								onValueChange={setShowAllDays}
								trackColor={{
									false: colorTheme.main.tertiary,
									true: colorTheme.accent.tertiary,
								}}
								thumbColor={showAllDays ? colorTheme.accent.primary : colorTheme.main.text}
							/>
						</View>

						<ScrollView horizontal keyboardShouldPersistTaps="handled" nestedScrollEnabled>
							<View style={{ minWidth: '100%', flexDirection: 'column' }}>
								{/* Header */}
								<View style={[styles.logRow, styles.logHeader]}>
									<Text style={[styles.logCell, styles.dateCell, styles.headerText]}>Date</Text>

									<Text style={[styles.logCell, styles.dayTypeCell, styles.headerText]}>
										Day Type
									</Text>

									<Text style={[styles.logCell, styles.statusCell, styles.headerText]}>Status</Text>

									<Text style={[styles.logCell, styles.punchCell, styles.headerText]}>
										Punch Time
									</Text>
								</View>

								{/* Body */}
								<ScrollView
									style={{
										maxHeight: height * 0.55,
										backgroundColor: colorTheme.main.primary,
									}}
								>
									{filteredLogs.length === 0 ? (
										<Text
											style={{
												color: colorTheme.main.text,
												padding: 10,
												textAlign: 'center',
												height: 40,
											}}
										>
											No data available
										</Text>
									) : (
										filteredLogs.map((entry, index) => {
											const isAbsent = entry.status?.toLowerCase() === 'absent'

											const isPresent = entry.status?.toLowerCase() === 'present'

											const isNonAttendance = entry.status === '-' || !entry.status

											return (
												<View key={`${entry.date}-${index}`} style={styles.logRow}>
													{/* Date */}
													<Text style={[styles.logCell, styles.dateCell]}>
														{entry.date}
														{'\n'}
														{entry.day}
													</Text>

													{/* Day Type */}
													<Text
														style={[
															styles.logCell,
															styles.dayTypeCell,
															isNonAttendance && styles.holiday,
														]}
													>
														{entry.dayType}
													</Text>

													{/* Status */}
													<Pressable style={[styles.logCell, styles.statusCell, styles.status]}>
														<Text
															style={
																isPresent ? styles.green : isAbsent ? styles.red : styles.holiday
															}
														>
															{entry.status}
														</Text>
													</Pressable>

													{/* Punch Time */}
													<Text
														style={[
															styles.logCell,
															styles.punchCell,
															isNonAttendance && styles.holiday,
														]}
													>
														{entry.punchTime}
													</Text>
												</View>
											)
										})
									)}

									<View
										style={{
											height: height * 0.2,
											width: '100%',
										}}
									/>
								</ScrollView>
							</View>
						</ScrollView>
					</View>
				</ScrollView>
			)}
		</Modalize>
	)
})

export default CapstoneSDPDetails
