module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				targets: process.env.NODE_ENV === "production" ? [
					"chrome 45",
					"firefox 44",
					"edge 17",
					"safari 11.1",
					"opera 32",
					"ios_saf 11.3",
					"and_chr 87",
					"and_ff 83",
					"and_qq 10.4",
					"and_uc 12.12",
					"not IE 11",
					"not op_mini all"
				] : [
					"last 1 chrome version",
					"last 1 firefox version",
					"last 1 safari version"
				],
				modules: false,
				useBuiltIns: "usage",
				corejs: {
					version: 3,
					proposals: false
				},
				forceAllTransforms: true
			}
		]
	]
}