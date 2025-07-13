const { withAndroidManifest } = require('@expo/config-plugins')

module.exports = function withInstallPermission(config) {
	return withAndroidManifest(config, (config) => {
		const manifest = config.modResults
		const permissions = manifest.manifest['uses-permission'] || []

		const requiredPermissions = [
			'android.permission.REQUEST_INSTALL_PACKAGES',
			'android.permission.POST_NOTIFICATIONS',
		]

		requiredPermissions.forEach((permissionName) => {
			const alreadyExists = permissions.some((p) => p.$['android:name'] === permissionName)
			if (!alreadyExists) {
				permissions.push({
					$: { 'android:name': permissionName },
				})
			}
		})

		manifest.manifest['uses-permission'] = permissions
		return config
	})
}
