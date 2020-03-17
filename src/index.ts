import path from 'path';
import { RawSource } from 'webpack-sources';

/* eslint-disable-next-line no-unused-vars */
import webpack from 'webpack';

type Context = {
	title?: string;
	htmlAttributes?: object;
	cssAttributes?: object;
	jsAttributes?: object;
};

type Options = {
	filename?: string;
	publicPath?: string;
	context?: Context;
	template?: (
		args: Context | { css: string; js: string; publicPath: string }
	) => string | Promise<string>;
	chunks?: string[];
};

class MiniHtmlWebpackPlugin implements webpack.Plugin {
	options: Options;

	constructor(options: Options) {
		this.options = options || {};
		this.plugin = this.plugin.bind(this);
	}

	plugin(compilation: webpack.compilation.Compilation, callback: () => {}) {
		const {
			filename = 'index.html',
			publicPath = '',
			template,
			context,
			chunks,
		} = this.options;

		const files = getFiles(
			normalizeEntrypoints(compilation.entrypoints),
			chunks
		);

		const options = Object.assign({}, { publicPath }, context, files);

		Promise.resolve((template || defaultTemplate)(options)).then(source => {
			compilation.assets[filename] = new RawSource(source);
			callback();
		});
	}

	apply(compiler: webpack.Compiler) {
		if (compiler.hooks) {
			// Webpack 4
			compiler.hooks.emit.tapAsync('MiniHtmlWebpackPlugin', this.plugin);
		} else {
			// Webpack 3
			compiler.plugin('emit', this.plugin);
		}
	}
}

type Files = { [id: string]: string[] };

function getFiles(
	entrypoints: webpack.compilation.Compilation['entrypoints'],
	chunks?: webpack.compilation.Compilation['chunks']
): Files {
	const ret: Files = {};

	entrypoints.forEach(entry => {
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

function normalizeEntrypoints(entrypoints: any) {
	// Webpack 4
	if (entrypoints.forEach) {
		return entrypoints;
	}

	// Webpack 3
	return Object.keys(entrypoints).map(name => entrypoints[name]);
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

function generateCSSReferences({
	files = [],
	publicPath = '',
	attributes = {},
}: {
	files: string[];
	publicPath: string;
	attributes: { rel?: string };
}) {
	const allAttributes = {
		...attributes,
		rel: 'rel' in attributes ? attributes.rel : 'stylesheet',
	};

	return files
		.map(
			file =>
				`<link href="${publicPath}${file}"${generateAttributes(allAttributes)}>`
		)
		.join('');
}

function generateJSReferences({
	files = [],
	publicPath = '',
	attributes = {},
}) {
	attributes = generateAttributes(attributes);

	return files
		.map(file => `<script src="${publicPath}${file}"${attributes}></script>`)
		.join('');
}

function generateAttributes(attributes = {}) {
	const stringAttributes = Object.entries(attributes);

	if (stringAttributes.length === 0) {
		return '';
	}

	return (
		' ' +
		stringAttributes
			.map(attr => {
				if (attr[1] === true) {
					return attr[0];
				}
				return `${attr[0]}="${attr[1]}"`;
			})
			.join(' ')
	);
}

export {
	MiniHtmlWebpackPlugin as default,
	defaultTemplate,
	generateAttributes,
	generateCSSReferences,
	generateJSReferences,
};
