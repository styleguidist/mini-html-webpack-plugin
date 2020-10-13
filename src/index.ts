import path from 'path';

import webpack, { Compilation } from 'webpack';

type Attributes = Record<string, any>;

type Context = {
	title?: string;
	htmlAttributes?: Attributes;
	cssAttributes?: Attributes;
	jsAttributes?: Attributes;
};

type Options = {
	filename?: string;
	publicPath?: string;
	context?: Context;
	template?: (
		args: Context & Files & { publicPath: string }
	) => string | Promise<string>;
	chunks?: string[];
};

type Files = { [id: string]: string[] };

function getFiles(
	entrypoints: Compilation['entrypoints'],
	chunks?: string[]
): Files {
	const ret: Files = {};

	entrypoints.forEach((entry) => {
		if (chunks && !chunks.includes(entry.name)) {
			return;
		}

		entry.getFiles().forEach((file: string) => {
			const extension = path.extname(file).replace(/\./, '');

			if (!ret[extension]) {
				ret[extension] = [];
			}

			ret[extension].push(file);
		});
	});

	return ret;
}

function generateAttributes(attributes = {}) {
	const stringAttributes = Object.entries(attributes);

	if (stringAttributes.length === 0) {
		return '';
	}

	return (
		' ' +
		stringAttributes
			.map((attr) => {
				if (attr[1] === true) {
					return attr[0];
				}
				return `${attr[0]}="${attr[1]}"`;
			})
			.join(' ')
	);
}

function generateCSSReferences({
	files = [],
	publicPath = '',
	attributes = {},
}: {
	files: string[];
	publicPath: string;
	attributes: (Attributes & { rel?: string }) | undefined;
}): string {
	if (!attributes) {
		return '';
	}

	const allAttributes = {
		...attributes,
		rel: 'rel' in attributes ? attributes.rel : 'stylesheet',
	};

	return files
		.map(
			(file) =>
				`<link href="${publicPath}${file}"${generateAttributes(allAttributes)}>`
		)
		.join('');
}

function generateJSReferences({
	files = [],
	publicPath = '',
	attributes = {},
}: {
	files: string[];
	publicPath: string;
	attributes: Attributes | undefined;
}): string {
	if (!attributes) {
		return '';
	}

	return files
		.map(
			(file) =>
				`<script src="${publicPath}${file}"${generateAttributes(
					attributes
				)}></script>`
		)
		.join('');
}

function defaultTemplate({
	css = [],
	js = [],
	publicPath = '',
	title = '',
	htmlAttributes = {
		lang: 'en',
	},
	head = '',
	body = '',
	cssAttributes = {},
	jsAttributes = {},
}: {
	css?: string[];
	js?: string[];
	publicPath?: string;
	head?: string;
	body?: string;
} & Context) {
	const htmlAttrs = generateAttributes(htmlAttributes);

	const cssTags = generateCSSReferences({
		files: css,
		attributes: cssAttributes,
		publicPath,
	});

	const jsTags = generateJSReferences({
		files: js,
		attributes: jsAttributes,
		publicPath,
	});

	return `<!DOCTYPE html>
  <html${htmlAttrs}>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${head}${cssTags}
    </head>
    <body>
      ${body}${jsTags}
    </body>
  </html>`;
}

function isWebpack4() {
	return webpack.version.split('.')[0] === '4';
}

class MiniHtmlWebpackPlugin {
	private options: Options;

	public constructor(options: Options) {
		this.options = options || {};
		this.webpack4plugin = this.webpack4plugin.bind(this);
		this.webpack5plugin = this.webpack5plugin.bind(this);
	}

	private webpack4plugin(compilation: Compilation, callback: () => {}) {
		const {
			filename = 'index.html',
			publicPath = '',
			template,
			context,
			chunks,
		} = this.options;
		const files = getFiles(compilation.entrypoints, chunks);
		const options = Object.assign({}, { publicPath }, context, files);

		Promise.resolve((template || defaultTemplate)(options)).then((source) => {
			// eslint-disable-next-line
			const sources = require('webpack-sources');

			compilation.assets[filename] = new sources.RawSource(source, true);
			callback();
		});
	}

	private webpack5plugin(compilation: Compilation) {
		const {
			filename = 'index.html',
			publicPath = '',
			template,
			context,
			chunks,
		} = this.options;
		const files = getFiles(compilation.entrypoints, chunks);
		const options = Object.assign({}, { publicPath }, context, files);

		return Promise.resolve((template || defaultTemplate)(options)).then(
			(source) => {
				// webpacks 5 exports `webpack-sources` to avoid cache problems
				// eslint-disable-next-line
				const { sources } = require('webpack');

				compilation.emitAsset(filename, new sources.RawSource(source, true));
			}
		);
	}

	public apply(compiler: webpack.Compiler) {
		const pluginName = 'MiniHtmlWebpackPlugin';

		if (isWebpack4()) {
			// @ts-ignore: Ignore for webpack 4 due to different typing
			compiler.hooks.emit.tapAsync(pluginName, this.webpack4plugin);
		} else {
			compiler.hooks.compilation.tap(pluginName, (compilation) => {
				compilation.hooks.processAssets.tapPromise(
					{
						name: pluginName,
						// https://github.com/webpack/webpack/blob/master/lib/Compilation.js#L3280
						stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
					},
					() => this.webpack5plugin(compilation)
				);
			});
		}
	}
}

export {
	MiniHtmlWebpackPlugin,
	defaultTemplate,
	generateAttributes,
	generateCSSReferences,
	generateJSReferences,
};
