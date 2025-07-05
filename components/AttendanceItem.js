import { Pressable, Text, View } from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import Fontisto from '@expo/vector-icons/Fontisto'
import Entypo from '@expo/vector-icons/Entypo'

import { useContext, useState } from 'react'
import { StyleSheet } from 'react-native'
import { formatCourseTitle } from '../util/formatCourseTitle'
import Foundation from '@expo/vector-icons/Foundation'

export default function AttendanceItem({
	data,
	minPercent,
	setTooltipText,
	setTooltipVisible,
	attendanceData,
	...props
}) {
	const { colorTheme } = useContext(ColorThemeContext)
	// console.log(attendanceData)
	const attendanceGreen = parseInt(data.percentage) >= parseInt(minPercent)
	const btwExamsGreen = parseInt(data.cat2FatPercentage) >= parseInt(minPercent)
	const splitData = data.courseDetails.split('-')
	const courseCode = splitData[0]
	const courseTitle = splitData[1]
	const style = StyleSheet.create({
		container: {
			width: '95%',
			height: 105,
			borderRadius: 5,
			overflow: 'hidden',
			alignSelf: 'center',
			marginBottom: '5%',
			display: 'flex',
			justifyContent: 'space-evenly',
			flexDirection: 'column',
			backgroundColor: colorTheme.main.primary,
			color: colorTheme.main.text,
			elevation: 10,
			shadowColor: colorTheme.accent.primary,
			shadowOffset: { width: -2, height: -4 },
			shadowOpacity: 0.3,
			shadowRadius: 5,
		},
		box: {
			padding: 8,
			paddingHorizontal: 20,
			width: '100%',
			justifyContent: 'center',
			flexDirection: 'row',
		},
		mainText: {
			color: colorTheme.main.text,
		},
		header: {
			marginTop: 5,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		course: {
			gap: 5,
			flexDirection: 'row',
			alignItems: 'center',
		},
		headerText: {
			fontSize: 14,
			fontWeight: 600,
		},
		percentage: {
			fontSize: 16,
			fontWeight: 600,
			backgroundColor: colorTheme.main.text,
			borderRadius: 5,
			padding: 3,
			paddingHorizontal: 8,
			marginRight: -2,
		},
		green: {
			color: '#01BD39FF',
		},
		red: {
			color: '#DA2C00FF',
		},
		greenBorder: {
			height: '100%',
			borderRadius: 10,
			borderLeftWidth: 10,
			borderLeftColor: '#01BD39FF',
			// borderBottomWidth: 5,
			// borderBottomColor: '#01BD39FF',
		},
		redBorder: {
			height: '100%',
			borderRadius: 10,
			borderLeftWidth: 10,
			borderLeftColor: '#DA2C00FF',
			// borderBottomWidth: 5,
			// borderBottomColor: '#DA2C00FF',
		},
		details: {
			flexDirection: 'row',
			justifyContent: 'space-evenly',
			marginTop: -8,
		},
		// detailsBox: {
		// 	width: '50%',
		// },
		detailsBox: {
			width: '33%',
		},
		buffer: {
			flexDirection: 'row-reverse',
		},

		icon: {
			fontSize: 18,
			marginTop: 0,
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

	return (
		<>
			<View style={style.container}>
				<View style={attendanceGreen ? style.greenBorder : style.redBorder}>
					<View style={[style.box, style.header]}>
						<View style={style.course}>
							{data.classType.includes('T') ? (
								<Entypo
									name="open-book"
									style={style.icon}
									size={18}
									color={colorTheme.main.text}
								/>
							) : (
								<Fontisto
									name="laboratory"
									style={style.icon}
									size={18}
									color={colorTheme.main.text}
								/>
							)}
							<Text style={[style.mainText, style.headerText]}>
								{formatCourseTitle(courseTitle, 35)}
							</Text>
						</View>
						<Text style={[style.percentage, attendanceGreen ? style.green : style.red]}>
							{data.percentage}%
						</Text>
					</View>

					<View style={[style.box, style.details]}>
						<View style={[style.attended, style.detailsBox]}>
							<View style={[style.backGround]}>
								<Text style={[style.mainText]}>Attended</Text>
								<Text style={[style.mainText]}>
									{data.classType.includes('T')
										? `${data.attended}/${data.totalClasses}`
										: `${parseInt(data.attended) / 2}/${parseInt(data.totalClasses) / 2}`}
								</Text>
							</View>
						</View>
						<View style={[style.betweenExams, style.detailsBox]}>
							<View style={[style.backGround]}>
								<Text
									style={[
										style.mainText,
										{ textAlign: 'center' },
										btwExamsGreen ? style.green : style.red,
									]}
								>
									Btw Exams
								</Text>
								<Text
									style={[
										style.mainText,
										{ textAlign: 'center' },
										btwExamsGreen ? style.green : style.red,
									]}
								>
									{data.cat2FatPercentage}%
								</Text>
							</View>
						</View>
						<View style={[style.buffer, style.detailsBox]}>
							<View style={[style.backGround]}>
								<View style={[style.bufferBox]}>
									<Text
										style={[
											style.mainText,
											{ textAlign: 'center' },
											attendanceGreen ? style.green : style.red,
										]}
									>
										{attendanceGreen ? 'Can Skip' : 'Must Attend'}
									</Text>

									<Pressable
										onPress={() => {
											setTooltipText(
												`This calculation excludes classes marked as "Not Posted" on VTOP.`
											)

											setTooltipVisible(true)
										}}
										style={[style.userStatus]}
									>
										<Text
											style={[
												style.mainText,
												{ textAlign: 'center' },
												attendanceGreen ? style.green : style.red,
											]}
										>
											{calcBufferClasses(
												minPercent,
												data.classType.includes('T')
													? attendanceData.attendance.attended
													: parseInt(attendanceData.attendance.attended) / 2,
												data.classType.includes('T')
													? attendanceData.attendance.absent
													: parseInt(attendanceData.attendance.absent) / 2
											)}
										</Text>
										<Foundation
											name="info"
											style={style.userDataInfo}
											color={colorTheme.accent.primary}
										/>
									</Pressable>
								</View>
							</View>
						</View>
					</View>
				</View>
			</View>
		</>
	)
}

function calcBufferClasses(minPercent, attended, absent) {
	const p = parseInt(minPercent)
	const a = parseInt(attended)
	const t = a + parseInt(absent)
	const percentage = (a * 100) / t
	if (percentage < p) return classesNeeded(a, t, p)
	return classesCanSkip(a, t, p)
}

function classesNeeded(a, t, p) {
	if (p <= (a / t) * 100) return 0 // already at or above target

	const x = (p * t - 100 * a) / (100 - p)
	return Math.ceil(x) // round up since you can't attend a fraction of a class
}

function classesCanSkip(a, t, p) {
	const x = (a * 100) / p - t
	return Math.floor(x >= 0 ? x : 0)
}
