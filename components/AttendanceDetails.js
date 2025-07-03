// components/AttendanceDetails.js
import { forwardRef } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { ScrollView } from 'react-native-gesture-handler'
import { Dimensions } from 'react-native'

const { height } = Dimensions.get('window')

const AttendanceDetails = forwardRef(
	({ selectedItem, courseItem, colorTheme, minPercent }, ref) => {
		if (!courseItem || !selectedItem) return null

		const courseDetailsData = courseItem?.courseDetails.split('-')
		const courseTitle = courseDetailsData[1]
		const courseCode = courseDetailsData[0]
		const courseTypeData = courseDetailsData[2]

		const attendanceGreen = parseInt(courseItem.attendance.percentage) >= parseInt(minPercent)
		const btwExamsGreen = parseInt(selectedItem.cat2FatPercentage) >= parseInt(minPercent)

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
			title: {
				fontSize: 18,
				fontWeight: '600',
				color: colorTheme.accent.primary,
				textAlign: 'center',
				marginBottom: 10,
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
				paddingVertical: 6,
				paddingHorizontal: 4,
				borderBottomWidth: 1,
				borderBottomColor: colorTheme.main.tertiary,
			},
			logHeader: {
				backgroundColor: colorTheme.main.primary,
			},
			logCell: {
				width: 130,
				paddingHorizontal: 6,
				alignContent: 'center',
				color: colorTheme.main.text,
				borderRightWidth: 1,
				borderRightColor: colorTheme.main.tertiary,
				borderLeftWidth: 1,
				borderLeftColor: colorTheme.main.tertiary,
				fontSize: 12,
				textAlign: 'center',
			},
			headerText: {
				fontWeight: '600',
				color: colorTheme.accent.primary,
				// textAlign: 'left',
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

		return (
			<Modalize
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
				scrollViewProps={{ showsVerticalScrollIndicator: false }}
			>
				<ScrollView contentContainerStyle={styles.content}>
					{selectedItem && courseItem ? (
						<View>
							<View style={styles.container}>
								<Text style={styles.title}>{courseTitle}</Text>

								<View style={styles.courseDetails}>
									<Text style={[styles.text, styles.courseDetailsText]}>
										{courseCode}
										{courseTypeData}
									</Text>
									<Text style={[styles.text, styles.courseDetailsText]}>{courseItem.faculty}</Text>
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
								<ScrollView horizontal>
									<View>
										<View style={[styles.logRow, styles.logHeader]}>
											<Text style={[styles.logCell, styles.headerText]}>Date/Time</Text>
											<Text style={[styles.logCell, styles.headerText]}>Status</Text>
											<Text style={[styles.logCell, styles.headerText]}>Action</Text>
											<Text style={[styles.logCell, styles.headerText]}>Reason</Text>
										</View>
										<ScrollView style={{ maxHeight: height * 0.45 }}>
											{courseItem.attendance.log.map((entry, index) => (
												<View key={index} style={styles.logRow}>
													<Text style={styles.logCell}>
														{entry.date}, {entry.day}
														{'\n'}
														{entry.time}, {entry.slot}
													</Text>
													<Text
														style={[styles.logCell, entry.isPresent ? styles.green : styles.red]}
													>
														{entry.status}
													</Text>
													<Text style={styles.logCell}>{'Coming soon'}</Text>
													<Text style={styles.logCell}>{entry.reason ? entry.reason : '-'}</Text>
												</View>
											))}
										</ScrollView>
									</View>
								</ScrollView>
							</View>
						</View>
					) : (
						<Text style={styles.text}>No data</Text>
					)}
				</ScrollView>
			</Modalize>
		)
	}
)

export default AttendanceDetails
