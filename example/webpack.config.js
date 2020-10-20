// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MiniHtmlWebpackPlugin } = require('../');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
		],
	},
	plugins: [
		new MiniHtmlWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
	],
};
