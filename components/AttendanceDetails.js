import { forwardRef, useEffect, useState } from 'react'
import { Text, StyleSheet, View, Pressable, TouchableOpacity } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { ScrollView } from 'react-native-gesture-handler'
import { Dimensions } from 'react-native'
import Fontisto from '@expo/vector-icons/Fontisto'
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import * as Haptics from 'expo-haptics'
import Foundation from '@expo/vector-icons/Foundation'
import { formatCourseTitle } from '../util/formatCourseTitle'
import AsyncStorage from '@react-native-async-storage/async-storage'
import calcBufferClasses from '../util/calcBufferClasses'
import Loading from './Loading'

const { height } = Dimensions.get('window')

const AttendanceDetails = forwardRef(
	({ selectedItem, courseItem, colorTheme, minPercent, userUpdated, setUserUpdated }, ref) => {
		const isEmpty = !selectedItem || !courseItem
		// console.log(selectedItem)
		const [loading, setLoading] = useState(true)
		const [tooltipVisible, setTooltipVisible] = useState(false)
		const [tooltipText, setTooltipText] = useState('')
		const [userPercent, setUserPercent] = useState(0)
		const [userModified, setUserModified] = useState(null)
		const [buttonLoading, setButtonLoading] = useState(null)

		useEffect(() => {
			async function getUserUpdatedData() {
				setLoading(true)
				const percent = callUserPercent()

				setUserPercent(percent)
				setLoading(false)
			}
			getUserUpdatedData()
		}, [userUpdated])

		const courseDetailsData = courseItem?.courseDetails?.split?.('-') || []

		const courseCode = courseDetailsData[0] || ''
		const courseTitle = courseDetailsData[1] || ''
		const courseTypeData = courseDetailsData[2] || ''

		const attendanceGreen = parseInt(courseItem?.attendance?.percentage) >= parseInt(minPercent)
		const btwExamsGreen = parseInt(selectedItem?.cat2FatPercentage) >= parseInt(minPercent)

		async function handleResetPress(item) {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
			setButtonLoading(`${item.date}#${item.time}`)
			let arr = []

			if (userUpdated) arr = userUpdated.filter((x) => x.id !== `${item.date}#${item.time}`)

			await AsyncStorage.setItem(
				`${selectedItem.courseID}-${selectedItem.classType}`,
				JSON.stringify(arr)
			)
			setUserUpdated(arr)
			setButtonLoading(null)
		}

		function callUserPercent() {
			if (isEmpty) return
			let attended = parseInt(courseItem.attendance.attended)
			let total = courseItem.attendance.attended + courseItem.attendance.absent
			if (!selectedItem.classType.includes('T')) {
				attended /= 2
				total /= 2
			}
			if (userUpdated) {
				total += userUpdated.filter((x) => x.original.toLowerCase() === 'not posted')?.length
				const userData = userUpdated.filter((x) => x.isPresent === true)?.length

				attended += userData
				setUserModified({
					attended,
					total,
				})
			}
			return Math.ceil((attended * 100) / total)
		}

		async function handlePresentPress(item, isPresent) {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
			// Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
			setButtonLoading(`${item.date}#${item.time}`)
			let arr = []
			if (userUpdated) arr = [...userUpdated]
			const updateObj = {
				date: item.date,
				time: item.time,
				id: `${item.date}#${item.time}`,
				isPresent,
				status: isPresent ? 'Present' : 'Absent',
				original: item.status,
			}
			arr.push(updateObj)
			await AsyncStorage.setItem(
				`${selectedItem.courseID}-${selectedItem.classType}`,
				JSON.stringify(arr)
			)
			setUserUpdated(arr)
			setButtonLoading(null)
		}

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
				gap: 5,
				marginTop: 10,
				marginBottom: 15,
			},
			icon: {
				// marginTop: 0,
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
				fontSize: 14,
				fontWeight: 400,
			},
			label: {
				fontSize: 16,
				fontWeight: '500',
				color: colorTheme.accent.secondary,
			},
			row: {
				flexDirection: 'row',
				marginBottom: 5,
			},
			courseDetails: {
				padding: 5,
				paddingVertical: 10,
				marginBottom: 30,
			},
			courseDetailsText: {
				color: colorTheme.main.tertiary,
			},
			attendanceDetails: {
				flexDirection: 'row',
				justifyContent: 'space-between',
				marginBottom: 5,
			},
			attendanceDetailsBox: {
				flexDirection: 'column',
			},
			green: {
				color: '#01BD39FF',
			},
			red: {
				color: '#FF0000FF',
			},
			percentageDetails: {
				flexDirection: 'row',
				justifyContent: 'space-between',
			},
			logRow: {
				flexDirection: 'row',
				borderBottomWidth: 1,
				borderBottomColor: colorTheme.accent.tertiary,
				backgroundColor: colorTheme.main.primary,
			},

			logHeader: {
				backgroundColor: colorTheme.main.primary,
				borderBottomWidth: 2,
				borderBottomColor: colorTheme.accent.tertiary,
			},

			logCell: {
				width: 130,
				paddingVertical: 8,
				paddingHorizontal: 6,
				color: colorTheme.main.text,
				fontSize: 12,
				textAlign: 'center',
				borderRightWidth: 1,
				borderRightColor: colorTheme.accent.tertiary,
				justifyContent: 'center',
			},

			lastLogCell: {
				borderRightWidth: 0, // Removes extra border at end
			},

			headerText: {
				fontWeight: '600',
				color: colorTheme.accent.primary,
				// textAlign: 'left',
			},
			buttonsText: {
				color: colorTheme.main.text,
				fontSize: 13,
				textAlign: 'center',
			},
			buttonsBox: {
				flexDirection: 'column',
				gap: 5,
				alignItems: 'center',
				textAlign: 'center',
			},
			buttons: {
				flexDirection: 'row',
				gap: 15,
			},
			btnIcon: {
				fontSize: 30,
			},
			userPercentBox: {
				flexDirection: 'row',
				textAlign: 'center',
				justifyContent: 'center',
				marginBottom: 5,
				gap: 5,
			},
			userPercentText: {
				color: colorTheme.main.text,
				fontWeight: '500',
			},
			userPercent: {
				color: colorTheme.accent.primary,
				fontWeight: '600',
			},
			userStatus: {
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 4,
			},
			userDataInfo: {
				marginTop: 3,
				fontSize: 15,
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
				<Text style={[styles.label]}>{label}: </Text>
				<Text
					style={[
						styles.text,
						{ fontWeight: '500', fontSize: 16 },
						green ? styles.green : styles.red,
					]}
				>
					{value}
				</Text>
			</View>
		)

		function renderAction(entry, isPresent, userUpdated) {
			if (isPresent) return null
			if (buttonLoading === `${entry.date}#${entry.time}`) return <Loading />
			if (userUpdated)
				return (
					<View style={[styles.buttonsBox]}>
						<Text style={[styles.buttonsText]}>Reset</Text>
						<TouchableOpacity
							delayPressIn={0}
							onPress={() => {
								handleResetPress(entry).catch((err) => console.log(err))
							}}
						>
							<FontAwesome
								name="refresh"
								size={24}
								style={[styles.btnIcon]}
								color={colorTheme.accent.primary}
							/>
						</TouchableOpacity>
					</View>
				)

			if (!isPresent)
				return (
					<View style={[styles.buttonsBox]}>
						<Text style={[styles.buttonsText]}>Present?</Text>
						<View style={[styles.buttons]}>
							<TouchableOpacity
								delayPressIn={0}
								onPress={() => {
									handlePresentPress(entry, true).catch((err) => console.log(err))
								}}
							>
								<FontAwesome
									name="check-circle"
									size={24}
									style={[styles.btnIcon]}
									color={colorTheme.accent.primary}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								delayPressIn={0}
								onPress={() => {
									handlePresentPress(entry, false).catch((err) => console.log(err))
								}}
							>
								<Entypo
									name="circle-with-cross"
									size={24}
									style={[styles.btnIcon]}
									color={colorTheme.accent.primary}
								/>
							</TouchableOpacity>
						</View>
					</View>
				)
		}

		return (
			<>
				<Modalize
					scrollViewProps={{
						showsVerticalScrollIndicator: false,
						keyboardShouldPersistTaps: 'handled',
						nestedScrollEnabled: true,
					}}
					ref={ref}
					snapPoint={height * 0.6}
					handleStyle={{
						backgroundColor: attendanceGreen || btwExamsGreen ? '#48FF00FF' : '#DA2C00FF',
					}}
					modalStyle={{
						backgroundColor: colorTheme.main.secondary,
						borderTopColor: attendanceGreen || btwExamsGreen ? '#48FF00FF' : '#DA2C00FF',
						borderTopWidth: 3,
						elevation: 5,
					}}
				>
					{isEmpty ? (
						<Text style={{ textAlign: 'center', padding: 20, color: colorTheme.main.text }}>
							No data
						</Text>
					) : loading ? (
						<Loading />
					) : (
						<>
							<ScrollView contentContainerStyle={styles.content}>
								{selectedItem && courseItem ? (
									<View>
										<View style={styles.container}>
											<View style={styles.titleBox}>
												{selectedItem.classType.includes('T') ? (
													<Entypo
														name="open-book"
														style={styles.icon}
														color={colorTheme.accent.primary}
													/>
												) : (
													<Fontisto
														name="laboratory"
														style={styles.icon}
														color={colorTheme.accent.primary}
													/>
												)}
												<Text style={styles.title}>{formatCourseTitle(courseTitle, 37)}</Text>
											</View>

											<View style={styles.courseDetails}>
												<Text style={[styles.text, styles.courseDetailsText]}>
													{courseCode}
													{courseTypeData}
												</Text>
												<Text style={[styles.text, styles.courseDetailsText]}>
													{courseItem.faculty}
												</Text>
												<Text style={[styles.text, styles.courseDetailsText]}>
													{courseItem.classDetails.split('- ')[1]}
												</Text>
											</View>

											<View style={styles.attendanceDetails}>
												<View style={styles.attendanceDetailsBox}>
													{renderRow(
														'Attended',
														`${courseItem.attendance.attended}/${courseItem.attendance.total}`
													)}
													{renderRow(
														'Not Posted',
														`${
															courseItem.attendance.total -
															courseItem.attendance.attended -
															courseItem.attendance.absent
														}`
													)}
												</View>
												<View style={styles.attendanceDetailsBox}>
													{renderRow('Absent', courseItem.attendance.absent)}
													{renderRow('On Duty', courseItem.attendance.onduty)}
												</View>
											</View>

											<View style={styles.percentageDetails}>
												{renderPercentageRow(
													'Percentage',
													`${courseItem.attendance.percentage}%`,
													attendanceGreen
												)}
												{selectedItem.cat2FatPercentage &&
													renderPercentageRow(
														'CAT2/FAT',
														`${selectedItem.cat2FatPercentage}%`,
														btwExamsGreen
													)}
											</View>
										</View>
										<View style={{ marginTop: 20, width: '100%' }}>
											{userUpdated && (
												<View>
													<View style={[styles.userPercentBox]}>
														<Text style={[styles.userPercentText]}>
															User calculated percentage:{' '}
														</Text>
														<Pressable
															onPress={() => {
																setTooltipText(
																	`This percentage is based on the attendance data you manually modified below.`
																)

																setTooltipVisible(true)
															}}
															style={[styles.userStatus]}
														>
															<Text style={[styles.userPercent]}>{userPercent}%</Text>
															<Foundation
																name="info"
																style={styles.userDataInfo}
																color={colorTheme.accent.primary}
															/>
														</Pressable>
													</View>
													{userModified && (
														<View style={[styles.userPercentBox]}>
															<Text style={[styles.userPercentText]}>
																{userPercent >= minPercent ? 'Can Skip:' : 'Must Attend:'}
															</Text>
															<Pressable
																onPress={() => {
																	setTooltipText(
																		`This calculation is based on the attendance data you manually modified below.`
																	)
																	setTooltipVisible(true)
																}}
																style={[styles.userStatus]}
															>
																<Text style={[styles.userPercent]}>
																	{calcBufferClasses(
																		minPercent,
																		userModified.attended,
																		userModified.total - userModified.attended
																	)}
																</Text>
																<Foundation
																	name="info"
																	style={styles.userDataInfo}
																	color={colorTheme.accent.primary}
																/>
															</Pressable>
														</View>
													)}
												</View>
											)}
											<ScrollView
												horizontal
												keyboardShouldPersistTaps="handled"
												nestedScrollEnabled
											>
												<View>
													<View style={[styles.logRow, styles.logHeader]}>
														<Text style={[styles.logCell, styles.headerText]}>Date/Time</Text>
														<Text style={[styles.logCell, styles.headerText]}>Status</Text>
														<Text style={[styles.logCell, styles.headerText]}>Action</Text>
														<Text style={[styles.logCell, styles.headerText, styles.lastLogCell]}>
															Reason
														</Text>
													</View>
													<ScrollView
														style={{
															maxHeight: userUpdated ? height * 0.39 : height * 0.45,
															backgroundColor: colorTheme.main.primary,
														}}
													>
														{!courseItem.attendance ||
														!courseItem.attendance?.log ||
														!(courseItem.attendance.log.length > 0) ? (
															<Text
																style={[
																	styles.logRow,
																	{
																		color: colorTheme.main.text,
																		padding: 10,
																		textAlign: 'center',
																		justifyContent: 'center',
																		height: 40,
																	},
																]}
															>
																No data available
															</Text>
														) : (
															courseItem.attendance.log.map((entry, index) => {
																const usrUpdated = userUpdated?.find(
																	(x) => x.id === `${entry.date}#${entry.time}`
																)

																return (
																	<View key={index} style={styles.logRow}>
																		<Text style={styles.logCell}>
																			{entry.date}, {entry.day}
																			{'\n'}
																			{entry.time}, {entry.slot}
																		</Text>

																		{usrUpdated ? (
																			<Pressable
																				onPress={() => {
																					setTooltipText(
																						`This class was marked as '${usrUpdated.status}' by you.\nOriginal VTOP status: '${entry.status}'.\n\nThis change will be automatically removed once the official VTOP data matches your input.`
																					)
																					setTooltipVisible(true)
																				}}
																				style={[styles.logCell, styles.userStatus]}
																			>
																				<Text
																					style={[
																						styles.userDataCell,
																						{ color: colorTheme.accent.primary },
																					]}
																				>
																					{usrUpdated.status}
																				</Text>
																				<Foundation
																					name="info"
																					style={styles.userDataInfo}
																					color={colorTheme.accent.primary}
																				/>
																			</Pressable>
																		) : (
																			<Text
																				style={[
																					styles.logCell,
																					entry.isPresent ? styles.green : styles.red,
																				]}
																			>
																				{entry.status}
																			</Text>
																		)}

																		<Text style={styles.logCell}>
																			{renderAction(entry, entry.isPresent, usrUpdated)}
																		</Text>

																		<Text style={[styles.logCell, styles.lastLogCell]}>
																			{entry.reason ? entry.reason : '-'}
																		</Text>
																	</View>
																)
															})
														)}
													</ScrollView>
												</View>
											</ScrollView>
										</View>
									</View>
								) : (
									<Text style={styles.text}>No data</Text>
								)}
							</ScrollView>

							{tooltipVisible && (
								<View
									style={{
										position: 'absolute',
										top: height * 0.4,
										left: '5%',
										width: '90%',
										padding: 10,
										backgroundColor: colorTheme.main.primary,
										borderRadius: 8,
										borderColor: colorTheme.accent.primary,
										borderWidth: 1,
										zIndex: 999,
									}}
								>
									<Text
										style={{ color: colorTheme.main.text, textAlign: 'center', marginBottom: 10 }}
									>
										{tooltipText}
									</Text>
									<Pressable
										onPress={() => setTooltipVisible(false)}
										style={{ alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 10 }}
									>
										<Text style={{ color: colorTheme.accent.primary, fontWeight: '500' }}>
											Close
										</Text>
									</Pressable>
								</View>
							)}
						</>
					)}
				</Modalize>
			</>
		)
	}
)

export default AttendanceDetails
