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

test('default options', async () => {
	const result = await compiler({}, getConfig());
	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom title', async () => {
	const result = await compiler({}, getConfig({ context: { title: 'Pizza' } }));
	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom template', async () => {
	const result = await compiler(
		{},
		getConfig({
			context: { title: 'Pizza' },
			template: ({ title }) => `<div>${title}</div>`,
		})
	);
	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom filename', async () => {
	const filename = 'pizza.html';
	const result = await compiler({}, getConfig({ filename }));
	expect(result.compilation.assets[filename]._value).toMatchSnapshot();
});

// TODO: https://github.com/webpack-contrib/test-utils/issues/2
/* test('custom publicPath', async () => {
	const publicPath = '/pizza/';
	const result = await compiler({}, getConfig({}, { output: { publicPath } }));
	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
}); */
