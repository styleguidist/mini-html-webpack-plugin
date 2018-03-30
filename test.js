const MiniHtmlWebpackPlugin = require('./index');
const compiler = require('@webpack-contrib/test-utils');

const getConfig = (options, config = {}) =>
	Object.assign(
		{
			entry: ['./index.js'],
			plugins: [new MiniHtmlWebpackPlugin(options)],
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

test('custom template', () => {
	return compiler(
		{},
		getConfig({
			context: { title: 'Pizza' },
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

// TODO: https://github.com/webpack-contrib/test-utils/issues/2
/* test('custom publicPath', () => {
	const publicPath = '/pizza/';
	return compiler({}, getConfig({}, { output: { publicPath } })).then(result => {
		expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
	});
}); */
