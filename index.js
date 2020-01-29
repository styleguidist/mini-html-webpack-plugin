const path = require('path');
const { RawSource } = require('webpack-sources');

class MiniHtmlWebpackPlugin {
	constructor(options = {}) {
		this.options = options;
		this.plugin = this.plugin.bind(this);
	}

	plugin(compilation, callback) {
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

	apply(compiler) {
		if (compiler.hooks) {
			// Webpack 4
			compiler.hooks.emit.tapAsync('MiniHtmlWebpackPlugin', this.plugin);
		} else {
			// Webpack 3
			compiler.plugin('emit', this.plugin);
		}
	}
}

function getFiles(entrypoints, chunks) {
	const ret = {};

	entrypoints.forEach(entry => {
		if (chunks && !chunks.includes(entry.name)) {
			return;
		}

		entry.getFiles().forEach(file => {
			const extension = path.extname(file).replace(/\./, '');

			if (!ret[extension]) {
				ret[extension] = [];
			}

			ret[extension].push(file);
		});
	});

	return ret;
}

function normalizeEntrypoints(entrypoints) {
	// Webpack 4
	if (entrypoints.forEach) {
		return entrypoints;
	}

	// Webpack 3
	return Object.keys(entrypoints).map(name => entrypoints[name]);
}

function defaultTemplate({
	css,
	js,
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

function generateCSSReferences({ files = [], publicPath, attributes = {} }) {
	const allAttributes = {
		...attributes,
		rel: 'rel' in attributes ? attributes.rel : 'stylesheet',
	};

	attributes = generateAttributes(allAttributes);

	return files
		.map(file => `<link href="${publicPath}${file}"${attributes}>`)
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
	attributes = Object.entries(attributes);

	if (attributes.length === 0) {
		return '';
	}

	return (
		' ' +
		attributes
			.map(attr => {
				if (attr[1] === true) {
					return attr[0];
				}
				return `${attr[0]}="${attr[1]}"`;
			})
			.join(' ')
	);
}

module.exports = MiniHtmlWebpackPlugin;
module.exports.defaultTemplate = defaultTemplate;
module.exports.generateAttributes = generateAttributes;
module.exports.generateCSSReferences = generateCSSReferences;
module.exports.generateJSReferences = generateJSReferences;
