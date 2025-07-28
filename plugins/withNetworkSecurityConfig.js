const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

function addNetworkSecurityConfigToManifest(androidManifest) {
	const app = androidManifest.manifest.application[0]

	// Ensure attributes exist
	app.$['android:usesCleartextTraffic'] = 'true'
	app.$['android:networkSecurityConfig'] = '@xml/network_security_config'

	return androidManifest
}

module.exports = function withNetworkSecurityConfig(config) {
	// Modify AndroidManifest.xml
	config = withAndroidManifest(config, (mod) => {
		mod.modResults = addNetworkSecurityConfigToManifest(mod.modResults)
		return mod
	})

	// Add XML file to res/xml/
	config = withDangerousMod(config, [
		'android',
		async (mod) => {
			const resPath = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/xml')
			if (!fs.existsSync(resPath)) fs.mkdirSync(resPath, { recursive: true })

			const xmlFilePath = path.join(resPath, 'network_security_config.xml')
			const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">172.18.10.10</domain>
  </domain-config>
</network-security-config>
`
			fs.writeFileSync(xmlFilePath, xmlContent)
			return mod
		},
	])

	return config
}
