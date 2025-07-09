import React, { forwardRef } from 'react'
import { Text, View, StyleSheet, Dimensions } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Modalize } from 'react-native-modalize'

const { height } = Dimensions.get('window')

const MarksDetails = forwardRef(({ data, colorTheme }, ref) => {
	if (!data) return null

	const tableHeaders = ['Title', 'Max', 'Weight %', 'Status', 'Scored', 'Weighted', 'Remark']

	const styles = StyleSheet.create({
		container: {
			padding: 10,
			width: '100%',
		},
		titleBox: {
			marginBottom: 15,
			borderBottomWidth: 1,
			borderColor: colorTheme.accent.tertiary,
			paddingBottom: 8,
		},
		title: {
			fontSize: 18,
			fontWeight: 'bold',
			color: colorTheme.accent.primary,
			textAlign: 'center',
		},
		subtitle: {
			color: colorTheme.main.tertiary,
			fontSize: 14,
			textAlign: 'center',
			marginTop: 4,
		},
		tableWrapper: {
			flexDirection: 'row',
		},
		table: {
			flexDirection: 'column',
			borderWidth: 1,
			borderColor: colorTheme.accent.primary,
			borderRadius: 5,
			minWidth: 700,
			// maxHeight: height * 0.8,
		},
		row: {
			flexDirection: 'row',
		},
		cell: {
			paddingVertical: 10,
			paddingHorizontal: 8,
			borderWidth: 1,
			borderColor: colorTheme.accent.tertiary,
			width: 120,
			textAlign: 'center',
			color: colorTheme.main.text,
		},
		headerCell: {
			backgroundColor: colorTheme.main.secondary,
			color: colorTheme.accent.primary,
			fontWeight: 'bold',
		},
	})

	return (
		<Modalize
			ref={ref}
			snapPoint={height * 0.7}
			modalStyle={{
				backgroundColor: colorTheme.main.primary,
				borderTopColor: colorTheme.accent.primary,
				borderTopWidth: 3,
			}}
			handleStyle={{ backgroundColor: colorTheme.accent.primary }}
		>
			<View style={styles.container}>
				<View style={styles.titleBox}>
					<Text style={styles.title}>{data.courseTitle}</Text>
					<Text style={styles.subtitle}>
						{data.courseCode} - {data.faculty}
					</Text>
				</View>

				<ScrollView
					horizontal
					contentContainerStyle={{
						flexGrow: 1,
					}}
				>
					<View style={{ minWidth: 700 }}>
						<ScrollView style={{ maxHeight: height * 0.5 }} showsVerticalScrollIndicator={true}>
							<View style={styles.table}>
								{/* Header row */}
								<View style={styles.row}>
									{tableHeaders.map((header, index) => (
										<Text key={index} style={[styles.cell, styles.headerCell]}>
											{header}
										</Text>
									))}
								</View>

								{/* Data rows */}
								{data.marks.map((entry, rowIndex) => (
									<View key={rowIndex} style={styles.row}>
										<Text style={styles.cell}>{entry.title}</Text>
										<Text style={styles.cell}>{entry.max}</Text>
										<Text style={styles.cell}>{entry.weightagePercent}</Text>
										<Text style={styles.cell}>{entry.status}</Text>
										<Text style={styles.cell}>{entry.scored}</Text>
										<Text style={styles.cell}>{entry.weightageMark}</Text>
										<Text style={styles.cell}>{entry.remark || '-'}</Text>
									</View>
								))}
							</View>
						</ScrollView>
					</View>
				</ScrollView>
			</View>
		</Modalize>
	)
})

export default MarksDetails
