const path = require("path");
const { RawSource } = require("webpack-sources");

class MiniHtmlWebpackPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const { filename, template, context } = this.options;

    compiler.plugin("emit", (compilation, cb) => {
      const files = getFiles(normalizeEntrypoints(compilation.entrypoints));

      compilation.assets[filename || "index.html"] = new RawSource(
        (template || defaultTemplate)({ ...context, ...files })
      );

      cb();
    });
  }
}

function getFiles(entrypoints) {
  const ret = {};

  entrypoints.forEach(entry => {
    entry.getFiles().forEach(file => {
      const extension = path.extname(file).replace(/\./, "");

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
  if (Array.isArray(entrypoints)) {
    return entrypoints;
  }

  // Webpack 3
  return Object.keys(entrypoints).map(name => entrypoints[name]);
}

function defaultTemplate({ css, js, title }) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>

      ${generateCSSReferences(css)}
    </head>
    <body>
      ${generateJSReferences(js)}
    </body>
  </html>`;
}

function generateCSSReferences(files = []) {
  return files.map(file => `<link href="/${file}" rel="stylesheet">`);
}

function generateJSReferences(files = []) {
  return files.map(file => `<script src="/${file}"></script>`);
}

module.exports = MiniHtmlWebpackPlugin;
module.exports.defaultTemplate = defaultTemplate;
module.exports.generateCSSReferences = generateCSSReferences;
module.exports.generateJSReferences = generateJSReferences;
