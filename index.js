const path = require('path');
const { RawSource } = require('webpack-sources');

class MiniHtmlWebpackPlugin {
	constructor(options) {
		this.options = options;
	}
	apply(compiler) {
		const { filename, template, context } = this.options;

		compiler.plugin('emit', (compilation, cb) => {
			const { publicPath } = compilation.options.output;
			const files = getFiles(normalizeEntrypoints(compilation.entrypoints));

			compilation.assets[filename || 'index.html'] = new RawSource(
				(template || defaultTemplate)({
					publicPath,
					...context,
					...files,
				})
			);

			cb();
		});
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

function defaultTemplate({ css, js, title, publicPath }) {
	return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>

      ${generateCSSReferences(css, publicPath)}
    </head>
    <body>
      ${generateJSReferences(js, publicPath)}
    </body>
  </html>`;
}

function generateCSSReferences(files = [], publicPath = '') {
	return files.map(
		file => `<link href="${publicPath}${file}" rel="stylesheet">`
	);
}

function generateJSReferences(files = [], publicPath = '') {
	return files.map(file => `<script src="${publicPath}${file}"></script>`);
}

module.exports = MiniHtmlWebpackPlugin;
module.exports.defaultTemplate = defaultTemplate;
module.exports.generateCSSReferences = generateCSSReferences;
module.exports.generateJSReferences = generateJSReferences;
