module.exports = {
	plugins: [
		require('postcss-import'),
		require('autoprefixer'),
		require('postcss-preset-env')({
			browsers: ['last 2 versions', '> 5%'],
		}),
		require('cssnano'),
	],
};
