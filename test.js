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

test('custom chunks', () => {
	return compiler(
		{},
		{
			entry: {
				index: './index.js',
				another: './another.js',
			},
			plugins: [
				new MiniHtmlWebpackPlugin({
					filename: 'index.html',
					chunks: ['index'],
				}),
				new MiniHtmlWebpackPlugin({
					filename: 'another.html',
					chunks: ['another'],
				}),
			],
		}
	).then(result => {
		// This should contain only reference to the index chunk and the related
		// runtime.
		expect(result.compilation.assets['index.html']._value).toMatchSnapshot();

		// This should contain only reference to the another chunk and the related
		// runtime.
		expect(result.compilation.assets['another.html']._value).toMatchSnapshot();
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

test('additional head', () => {
	return compiler(
		{},
		getConfig({
			context: {
				head:
					'<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
			},
		})
	).then(result => {
		expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
	});
});

test('additional body', () => {
	return compiler({}, getConfig({ context: { body: '<div>Demo</div>' } })).then(
		result => {
			expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
		}
	);
});

test('custom js attribute', () => {
	return compiler(
		{},
		getConfig({ context: { jsAttributes: { defer: 'defer' } } })
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

test('custom async template', () => {
	return compiler(
		{},
		getConfig({
			context: { title: 'Pizza' },
			template: ({ title }) => {
				const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
				return delay(50).then(() => `<div>${title}</div>`);
			},
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
