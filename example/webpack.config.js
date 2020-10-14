// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MiniHtmlWebpackPlugin } = require('../');

module.exports = {
	mode: 'production',
	plugins: [new MiniHtmlWebpackPlugin()],
};
