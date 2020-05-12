import path from 'path';
import { RawSource } from 'webpack-sources';

import webpack from 'webpack';

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
	entrypoints: webpack.compilation.Compilation['entrypoints'],
	chunks?: webpack.compilation.Compilation['chunks']
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
}) {
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

class MiniHtmlWebpackPlugin implements webpack.Plugin {
	private options: Options;

	public constructor(options: Options) {
		this.options = options || {};
		this.plugin = this.plugin.bind(this);
	}

	private plugin(
		compilation: webpack.compilation.Compilation,
		callback: () => {}
	) {
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
			compilation.assets[filename] = new RawSource(source);
			callback();
		});
	}

	public apply(compiler: webpack.Compiler) {
		compiler.hooks.emit.tapAsync('MiniHtmlWebpackPlugin', this.plugin);
	}
}

export {
	MiniHtmlWebpackPlugin,
	defaultTemplate,
	generateAttributes,
	generateCSSReferences,
	generateJSReferences,
};
