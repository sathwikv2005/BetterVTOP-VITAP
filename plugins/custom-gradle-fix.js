const { withAppBuildGradle } = require('@expo/config-plugins')

module.exports = function withCustomGradleFix(config) {
	return withAppBuildGradle(config, (config) => {
		config.modResults.contents = config.modResults.contents.replace(
			/applicationVariants\.all[\s\S]*?}\n\s*}/,
			`
      applicationVariants.all { variant ->
        if (variant.buildType.name == "release") {
            variant.outputs.all { output ->
                outputFileName = "BetterVTOP.apk"
            }
        }
      }`
		)
		return config
	})
}
