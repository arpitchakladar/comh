module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				targets: process.env.NODE_ENV === "production" ? [
					">0.2%",
					"not dead",
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