import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, { Configuration } from 'webpack';
import { MiniHtmlWebpackPlugin } from '../src';

function compiler(config: Configuration) {
	return new Promise((resolve, reject) =>
		webpack(config, (err, stats) => {
			if (err) {
				return reject(err);
			}

			if (stats.hasErrors()) {
				return reject(stats.toString('errors-only'));
			}

			return resolve();
		})
	);
}

// TODO: Extract results for testing
// https://survivejs.com/webpack/developing/composing-configuration/#guidelines-for-building-your-own-configuration-packages
const getConfig = (
	options: {},
	config: { title?: string } = {}
): Configuration =>
	// @ts-ignore: It looks like there's a type problem in MiniCssExtractPlugin
	Object.assign(
		{
			entry: { main: './main.js' },
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

test('default options', async () => {
	const result = await compiler(getConfig({}));

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom chunks', async () => {
	const result = await compiler({
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
	});

	// This should contain only reference to the index chunk and the related
	// runtime.
	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();

	// This should contain only reference to the another chunk and the related
	// runtime.
	expect(result.compilation.assets['another.html']._value).toMatchSnapshot();
});

test('custom title', async () => {
	const result = await compiler(
		getConfig({ context: { title: 'Pizza' } })
	).then();

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom lang', async () => {
	const result = await compiler(
		getConfig({ context: { htmlAttributes: { lang: 'ru' } } })
	);

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('additional head', async () => {
	const result = await compiler(
		getConfig({
			context: {
				head:
					'<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
			},
		})
	);

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('additional body', async () => {
	const result = await compiler(
		getConfig({ context: { body: '<div>Demo</div>' } })
	);

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom template', async () => {
	const result = await compiler(
		getConfig({
			context: { title: 'Pizza', htmlAttributes: { lang: 'it' } },
			template: ({ title }: { title: string }) => `<div>${title}</div>`,
		})
	);

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom async template', async () => {
	const result = await compiler(
		getConfig({
			context: { title: 'Pizza' },
			template: ({ title }: { title: string }) => {
				const delay = (ms: number) =>
					new Promise((resolve) => setTimeout(resolve, ms));
				return delay(50).then(() => `<div>${title}</div>`);
			},
		})
	);

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom filename', async () => {
	const filename = 'pizza.html';
	const result = await compiler(getConfig({ filename }));

	expect(result.compilation.assets[filename]._value).toMatchSnapshot();
});

test('custom publicPath', async () => {
	const result = await compiler(getConfig({ publicPath: 'pizza/' }));

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});

test('custom attributes', async () => {
	const result = await compiler(
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
	);

	expect(result.compilation.assets['index.html']._value).toMatchSnapshot();
});
