const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

function addNetworkSecurityConfigToManifest(androidManifest) {
	const app = androidManifest.manifest.application[0]

	app.$['android:usesCleartextTraffic'] = 'true'
	app.$['android:networkSecurityConfig'] = '@xml/network_security_config'

	return androidManifest
}

module.exports = function withNetworkSecurityConfig(config) {
	config = withAndroidManifest(config, (mod) => {
		mod.modResults = addNetworkSecurityConfigToManifest(mod.modResults)
		return mod
	})

	config = withDangerousMod(config, [
		'android',
		async (mod) => {
			const projectRoot = mod.modRequest.platformProjectRoot

			const xmlDir = path.join(projectRoot, 'app/src/main/res/xml')
			const rawDir = path.join(projectRoot, 'app/src/main/res/raw')

			const xmlFilePath = path.join(xmlDir, 'network_security_config.xml')
			const certDstPath = path.join(rawDir, 'vtop_ca.pem')

			fs.mkdirSync(xmlDir, { recursive: true })
			fs.mkdirSync(rawDir, { recursive: true })

			const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>

    <!-- Default: normal Android trust -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <!-- VTOP-specific trust override -->
    <domain-config>
        <domain includeSubdomains="true">vtop.vitap.ac.in</domain>
        <trust-anchors>
            <certificates src="@raw/vtop_ca" />
            <certificates src="system" />
        </trust-anchors>
    </domain-config>

</network-security-config>
`
			fs.writeFileSync(xmlFilePath, xmlContent)

			const certSrcPath = path.join(__dirname, '..', 'vtop_ca.pem')

			if (!fs.existsSync(certSrcPath)) {
				throw new Error('vtop_ca.pem not found. Place it next to withNetworkSecurityConfig.js')
			}

			fs.copyFileSync(certSrcPath, certDstPath)

			return mod
		},
	])

	return config
}
