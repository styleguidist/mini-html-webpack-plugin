import webpack, { Configuration } from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { MiniHtmlWebpackPlugin } from '../src';

function compile(config: Configuration, filenames = ['index.html']) {
	return new Promise((resolve, reject) => {
		const compiler = webpack(config);

		// @ts-ignore: There's a type mismatch but this should work based on webpack source
		compiler.outputFileSystem = createFsFromVolume(new Volume());
		const memfs = compiler.outputFileSystem;

		compiler.run((err, stats) => {
			if (err) {
				return reject(err);
			}

			if (stats.hasErrors()) {
				return reject(stats.toString('errors-only'));
			}

			const ret = {};

			filenames.forEach((filename) => {
				// @ts-ignore: The type is wrong here
				ret[filename] = memfs.readFileSync(`./dist/${filename}`, {
					encoding: 'utf-8',
				});
			});

			return resolve(ret);
		});
	});
}

const getConfig = (
	options: {},
	config: { title?: string } = {}
): Configuration =>
	Object.assign(
		{
			entry: { main: './test/fixtures/index.js' },
			plugins: [new MiniHtmlWebpackPlugin(options)],
		},
		config
	);

test('default options', async () => {
	const result = await compile(getConfig({}));

	expect(result['index.html']).toMatchSnapshot();
});

test('mini-css-extract-plugin', async () => {
	const result = await compile({
		mode: 'production',
		entry: { main: './test/fixtures/index.js' },
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, 'css-loader'],
				},
			],
		},
		plugins: [
			new MiniHtmlWebpackPlugin({}),
			// @ts-ignore: MCEP TS declarations are broken
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
		],
	});

	expect(result['index.html']).toMatchSnapshot();
});

test('custom chunks', async () => {
	const result = await compile(
		{
			entry: {
				index: './test/fixtures/index.js',
				another: './test/fixtures/another.js',
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
		},
		['index.html', 'another.html']
	);

	// This should contain only reference to the index chunk and the related
	// runtime.
	expect(result['index.html']).toMatchSnapshot();

	// This should contain only reference to the another chunk and the related
	// runtime.
	expect(result['another.html']).toMatchSnapshot();
});

test('custom title', async () => {
	const result = await compile(
		getConfig({ context: { title: 'Pizza' } })
	).then();

	expect(result['index.html']).toMatchSnapshot();
});

test('custom lang', async () => {
	const result = await compile(
		getConfig({ context: { htmlAttributes: { lang: 'ru' } } })
	);

	expect(result['index.html']).toMatchSnapshot();
});

test('additional head', async () => {
	const result = await compile(
		getConfig({
			context: {
				head:
					'<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
			},
		})
	);

	expect(result['index.html']).toMatchSnapshot();
});

test('additional body', async () => {
	const result = await compile(
		getConfig({ context: { body: '<div>Demo</div>' } })
	);

	expect(result['index.html']).toMatchSnapshot();
});

test('custom template', async () => {
	const result = await compile(
		getConfig({
			context: { title: 'Pizza', htmlAttributes: { lang: 'it' } },
			template: ({ title }: { title: string }) => `<div>${title}</div>`,
		})
	);

	expect(result['index.html']).toMatchSnapshot();
});

test('custom async template', async () => {
	const result = await compile(
		getConfig({
			context: { title: 'Pizza' },
			template: ({ title }: { title: string }) => {
				const delay = (ms: number) =>
					new Promise((resolve) => setTimeout(resolve, ms));
				return delay(50).then(() => `<div>${title}</div>`);
			},
		})
	);

	expect(result['index.html']).toMatchSnapshot();
});

test('custom filename', async () => {
	const filename = 'pizza.html';
	const result = await compile(getConfig({ filename }), [filename]);

	expect(result[filename]).toMatchSnapshot();
});

test('custom publicPath', async () => {
	const result = await compile(getConfig({ publicPath: 'pizza/' }));

	expect(result['index.html']).toMatchSnapshot();
});

test('custom attributes', async () => {
	const result = await compile(
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

	expect(result['index.html']).toMatchSnapshot();
});
