const { withAppBuildGradle } = require('@expo/config-plugins')

module.exports = function withCustomGradleFix(config) {
	return withAppBuildGradle(config, (config) => {
		const gradle = config.modResults.contents

		// Avoid adding it multiple times
		if (!gradle.includes('outputFileName = "BetterVTOP-${version}.apk"')) {
			config.modResults.contents += `

android.applicationVariants.all { variant ->
    if (variant.buildType.name == "release") {
        variant.outputs.all { output ->
            def version = variant.versionName
            outputFileName = "BetterVTOP-\${version}.apk"
        }
    }
}
`
		}

		return config
	})
}
