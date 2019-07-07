const path = require('path');
const { RawSource } = require('webpack-sources');

class MiniHtmlWebpackPlugin {
	constructor(options = {}) {
		this.options = options;
		this.plugin = this.plugin.bind(this);
	}

	plugin(compilation, callback) {
		const { publicPath } = compilation.options.output;
		const { filename = 'index.html', template, context } = this.options;

		const files = getFiles(normalizeEntrypoints(compilation.entrypoints));

		compilation.assets[filename] = new RawSource(
			(template || defaultTemplate)(
				Object.assign(
					{},
					{
						publicPath,
					},
					context,
					files
				)
			)
		);

		callback();
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

function getFiles(entrypoints) {
	const ret = {};

	entrypoints.forEach(entry => {
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
	cssAttributes = {},
	jsAttributes = {},
}) {
	const htmlAttrs = generateAttributes(htmlAttributes);

	const cssTags = generateCSSReferences({
		files: css,
		publicPath,
		cssAttributes: generateAttributes(cssAttributes),
	});

	const jsTags = generateJSReferences({
		files: js,
		publicPath,
		jsAttributes: generateAttributes(jsAttributes),
	});

	return `<!DOCTYPE html>
  <html${htmlAttrs}>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${cssTags}
    </head>
    <body>
      ${jsTags}
    </body>
  </html>`;
}

function generateCSSReferences({
	files = [],
	publicPath = '',
	cssAttributes = '',
}) {
	return files
		.map(
			file =>
				`<link href="${publicPath}${file}" rel="stylesheet"${cssAttributes}>`
		)
		.join('');
}

function generateJSReferences({
	files = [],
	publicPath = '',
	jsAttributes = '',
}) {
	return files
		.map(file => `<script src="${publicPath}${file}"${jsAttributes}></script>`)
		.join('');
}

function generateAttributes(attributes = {}) {
	attributes = Object.entries(attributes);

	if (attributes.length === 0) {
		return '';
	}

	return (
		' ' +
		attributes.map(attribute => `${attribute[0]}="${attribute[1]}"`).join(' ')
	);
}

module.exports = MiniHtmlWebpackPlugin;
module.exports.defaultTemplate = defaultTemplate;
module.exports.generateAttributes = generateAttributes;
module.exports.generateCSSReferences = generateCSSReferences;
module.exports.generateJSReferences = generateJSReferences;
