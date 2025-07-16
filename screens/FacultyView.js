import { useContext, useRef, useState } from 'react'
import {
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	View,
	Pressable,
	ScrollView,
	Dimensions,
} from 'react-native'
import { ColorThemeContext } from '../context/ColorThemeContext'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import facultyData from '../faculty.json'
import { Modalize } from 'react-native-modalize'

const { height } = Dimensions.get('window')

export default function FacultyView() {
	const { colorTheme } = useContext(ColorThemeContext)
	const [search, setSearch] = useState('')
	const [faculty, setFaculty] = useState(facultyData)
	const [selectedFaculty, setSelectedFaculty] = useState(null)
	const modalRef = useRef(null)

	function searchHandle(text) {
		setSearch(text)
		if (text.trim() === '') {
			setFaculty(facultyData)
		} else {
			setFaculty(facultyData.filter((x) => x.name.toLowerCase().includes(text.toLowerCase())))
		}
	}

	function openFacultyModal(item) {
		setSelectedFaculty(item)
		modalRef.current?.open()
	}

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			width: '100%',
			alignItems: 'center',
			marginTop: 20,
		},
		searchBox: {
			width: '85%',
			backgroundColor: colorTheme.main.secondary,
			height: 60,
			borderRadius: 10,
			borderColor: colorTheme.accent.tertiary,
			borderWidth: 1,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 20,
			marginBottom: 20,
		},
		searchIcon: {
			color: colorTheme.accent.primary,
			marginBottom: 5,
		},
		input: {
			color: colorTheme.main.text,
			flex: 1,
		},
		facultyList: {
			width: '100%',
			justifyContent: 'center',
		},
		card: {
			width: '92%',
			backgroundColor: colorTheme.main.secondary,
			borderRadius: 10,
			padding: 15,
			marginVertical: 8,
			flexDirection: 'row',
			alignItems: 'center',
			alignSelf: 'center',
			gap: 15,
			borderColor: colorTheme.accent.tertiary,
			borderWidth: 1,
		},
		initialCircle: {
			width: 50,
			height: 50,
			borderRadius: 25,
			backgroundColor: colorTheme.accent.primary,
			justifyContent: 'center',
			alignItems: 'center',
		},

		personIcon: {
			color: colorTheme.main.primary,
			fontWeight: 'bold',
			fontSize: 20,
		},

		infoContainer: {
			flexDirection: 'column',
			flex: 1,
		},
		nameText: {
			color: colorTheme.main.text,
			fontSize: 16,
			fontWeight: 'bold',
		},
		schoolText: {
			color: colorTheme.main.text,
			fontSize: 13,
			marginTop: 8,
			opacity: 0.7,
		},
		modalContent: {
			padding: 10,
		},
		titleBox: {
			width: '90%',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			alignSelf: 'center',
			// textAlign: 'center',
			paddingHorizontal: 10,
			gap: 10,
			marginBottom: 25,
			marginTop: 10,
			// flexWrap: 'wrap',
		},

		personIcon2: {
			color: colorTheme.accent.primary,
			fontWeight: 'bold',
			fontSize: 28,
			// marginBottom: 14,
		},
		modalTitle: {
			fontSize: 18,
			fontWeight: 'bold',
			color: colorTheme.accent.primary,
			textAlign: 'center',
			// flexWrap: 'wrap',
			// marginBottom: 20,
		},
		infoBlock: {
			marginBottom: 12,
			gap: 2,
		},
		infoLabel: {
			color: colorTheme.accent.primary,
			fontSize: 17,
			marginBottom: 2,
			fontWeight: '600',
		},
		infoText: {
			fontSize: 14,
			color: colorTheme.main.text,
			marginLeft: 15,
			opacity: 0.9,
		},
		openHour: {
			marginLeft: 10,
			marginBottom: 3,
			opacity: 0.9,
			color: colorTheme.main.text,
			fontSize: 14,
		},
		sectionHeader: {
			color: colorTheme.accent.secondary,
			fontSize: 17,
			fontWeight: '600',
			marginTop: 3,
			marginBottom: 4,
		},
		detailsCard: {
			width: '95%',
			alignSelf: 'center',
			backgroundColor: colorTheme.main.secondary,
			borderColor: colorTheme.main.tertiary,
			borderWidth: 1,
			padding: 15,
			paddingHorizontal: 25,
			borderRadius: 10,
			marginBottom: 35,
			elevation: 8,
			shadowColor: colorTheme.accent.primary,
		},
	})

	function renderFaculty({ item }) {
		return (
			<Pressable style={styles.card} onPress={() => openFacultyModal(item)}>
				<View style={styles.initialCircle}>
					<FontAwesome5 name="user-graduate" style={styles.personIcon} />
				</View>
				<View style={styles.infoContainer}>
					<Text style={styles.nameText}>{item.name}</Text>
					<Text style={styles.schoolText}>{item.school}</Text>
				</View>
			</Pressable>
		)
	}

	return (
		<View style={styles.container}>
			<View style={styles.searchBox}>
				<TextInput
					placeholder="Search professors by name..."
					placeholderTextColor={colorTheme.main.placeholder}
					style={styles.input}
					onChangeText={searchHandle}
					value={search}
				/>
				{search ? (
					<FontAwesome
						name="close"
						size={26}
						style={[styles.searchIcon, { marginBottom: 0 }]}
						onPress={() => searchHandle('')}
					/>
				) : (
					<FontAwesome name="search" size={24} style={styles.searchIcon} />
				)}
			</View>

			<View style={[styles.facultyList]}>
				<FlatList
					data={faculty}
					renderItem={renderFaculty}
					keyExtractor={(item, index) => index.toString()}
					contentContainerStyle={{ paddingBottom: 20 }}
				/>
			</View>

			<Modalize
				ref={modalRef}
				snapPoint={height * 0.6}
				handleStyle={{ backgroundColor: colorTheme.accent.primary }}
				modalStyle={{
					backgroundColor: colorTheme.main.primary,
					borderTopColor: colorTheme.accent.primary,
					borderTopWidth: 3,
				}}
			>
				<ScrollView style={styles.modalContent}>
					{selectedFaculty && (
						<>
							<View style={styles.titleBox}>
								<FontAwesome5 name="user-graduate" style={styles.personIcon2} />
								<Text style={styles.modalTitle}>{selectedFaculty.name}</Text>
							</View>

							{/* Contact & Availability */}
							<View style={styles.detailsCard}>
								<View style={styles.infoBlock}>
									<Text style={styles.infoLabel}>Cabin</Text>
									<Text style={styles.infoText}>{selectedFaculty.cabin || 'Not specified'}</Text>
								</View>

								<View style={styles.infoBlock}>
									<Text style={styles.infoLabel}>Email</Text>
									<Text style={styles.infoText} selectable={true}>
										{selectedFaculty.email}
									</Text>
								</View>

								{selectedFaculty.open_hours?.length > 0 && (
									<View style={[styles.infoBlock]}>
										<Text style={styles.sectionHeader}>Open Hours</Text>
										{selectedFaculty.open_hours?.length > 0 ? (
											selectedFaculty.open_hours.map((slot, index) => (
												<Text key={index} style={styles.openHour}>
													• {slot.weekday} – {slot.hours}
												</Text>
											))
										) : (
											<Text style={styles.openHour}>• Not available</Text>
										)}
									</View>
								)}
							</View>

							{/* Professional Info */}
							<View style={styles.detailsCard}>
								<View style={styles.infoBlock}>
									<Text style={styles.infoLabel}>School</Text>
									<Text style={styles.infoText}>{selectedFaculty.school}</Text>
								</View>

								<View style={styles.infoBlock}>
									<Text style={styles.infoLabel}>Department</Text>
									<Text style={styles.infoText}>{selectedFaculty.department}</Text>
								</View>

								<View style={styles.infoBlock}>
									<Text style={styles.infoLabel}>Designation</Text>
									<Text style={styles.infoText}>{selectedFaculty.designation}</Text>
								</View>
							</View>
						</>
					)}
				</ScrollView>
			</Modalize>
		</View>
	)
}
