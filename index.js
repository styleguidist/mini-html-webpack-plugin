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
				Object.assign({}, { publicPath }, context, files)
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

function defaultTemplate(context) {
	const {
		title = '',
		css,
		js,
		publicPath,
		jsAttributes,
		cssAttributes
	} = context;

	return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${generateCSSReferences(css, publicPath, jsAttributes)}
    </head>
    <body>
      ${generateJSReferences(js, publicPath, cssAttributes)}
    </body>
  </html>`;
}

function generateCSSReferences(files = [], publicPath = '', attributes = {}) {
	const attr = generateAttributes(attributes) || '';

	return files
		.map(file => `<link href="${publicPath}${file}" rel="stylesheet" ${attr}>`)
		.join('');
}

function generateJSReferences(files = [], publicPath = '', attributes = {}) {
	const attr = generateAttributes(attributes) || '';

	return files
		.map(file => `<script src="${publicPath}${file}" ${attr}></script>`)
		.join('');
}

function generateAttributes(obj) {
  return Object.keys(obj)
    .map(key => `${key}="${obj[key]}"`)
    .join(' ');
}

module.exports = MiniHtmlWebpackPlugin;
module.exports.defaultTemplate = defaultTemplate;
module.exports.generateCSSReferences = generateCSSReferences;
module.exports.generateJSReferences = generateJSReferences;
