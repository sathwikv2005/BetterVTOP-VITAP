import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'

export async function requestStoragePermission() {
	const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
	return result === RESULTS.GRANTED
}
