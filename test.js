const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const compiler = require('@webpack-contrib/test-utils');
const MiniHtmlWebpackPlugin = require('./index');

const getConfig = (options, config = {}) =>
	Object.assign(
		{
			entry: ['./main.js'],
			module: {
				rules: [
					{
						test: /\.css$/,
						use: [
							{ loader: MiniCssExtractPlugin.loader },
							{ loader: 'css-loader' },
						],
					},
				],
			},
			plugins: [new MiniCssExtractPlugin(), new MiniHtmlWebpackPlugin(options)],
		},
		config
	);

test('default options', () => {
	return compiler({}, getConfig()).then(result => {
		expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
	});
});

test('custom title', () => {
	return compiler({}, getConfig({ context: { title: 'Pizza' } })).then(
		result => {
			expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
		}
	);
});

test('custom lang', () => {
	return compiler(
		{},
		getConfig({ context: { htmlAttributes: { lang: 'ru' } } })
	).then(result => {
		expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
	});
});

test('custom template', () => {
	return compiler(
		{},
		getConfig({
			context: { title: 'Pizza', htmlAttributes: { lang: 'it' } },
			template: ({ title }) => `<div>${title}</div>`,
		})
	).then(result => {
		expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
	});
});

test('custom filename', () => {
	const filename = 'pizza.html';
	return compiler({}, getConfig({ filename })).then(result => {
		expect(result.compilation.assets[filename]._value).toMatchSnapshot();
	});
});

test('custom publicPath', () => {
	return compiler({}, getConfig({ publicPath: 'pizza/' })).then(result => {
		expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
	});
});

test('custom attributes', () => {
	return compiler(
		{},
		getConfig({
			context: {
				cssAttributes: {
					rel: 'preload',
					as: 'style',
				},
				jsAttributes: {
					defer: true,
				},
			},
		})
	).then(result => {
		expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
	});
});
