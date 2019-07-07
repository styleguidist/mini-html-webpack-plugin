# mini-html-webpack-plugin: a miniature version of html-webpack-plugin with only necessary features

[![npm](https://img.shields.io/npm/v/mini-html-webpack-plugin.svg)](https://www.npmjs.com/package/mini-html-webpack-plugin) [![Build Status](https://travis-ci.org/styleguidist/mini-html-webpack-plugin.svg)](https://travis-ci.org/styleguidist/mini-html-webpack-plugin)

The plugin writes CSS and JS asset paths for you automatically. Works with webpack 3 and 4.

**It does not work with html-webpack-plugin plugins!**

## Usage

```sh
npm install mini-html-webpack-plugin
```

```javascript
const MiniHtmlWebpackPlugin = require('mini-html-webpack-plugin');

const config = {
  plugins: [
    new MiniHtmlWebpackPlugin({
      // Optional, defaults to `index.html`
      filename: 'demo.html',
      // Optional
      publicPath: 'demo/',
      context: {
        title: 'Webpack demo',
        // Optional, defaults to `{ lang: 'en' }`
        htmlAttributes: { lang: 'en' },
        // Optional
        cssAttributes: { rel: 'preload' },
        // Optional
        jsAttributes: { defer: 'defer' }
      }
    })
  ]
};
```

### HTML minification

```javascript
const minify = require('html-minifier').minify;
const MiniHtmlWebpackPlugin = require('mini-html-webpack-plugin');

const config = {
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title: 'Minification demo'
      },
      template: context =>
        minify(MiniHtmlWebpackPlugin.defaultTemplate(context))
    })
  ]
};
```

### Custom templates

Use [@vxna/mini-html-webpack-template](https://www.npmjs.com/package/@vxna/mini-html-webpack-template) to add an app container div, a favicon, meta tags, inline JavaScript or CSS.

Or define a template function to generate your own code:

```js
const MiniHtmlWebpackPlugin = require('mini-html-webpack-plugin');
const {
  generateAttributes,
  generateCSSReferences,
  generateJSReferences
} = MiniHtmlWebpackPlugin;

const config = {
  plugins: [
    new MiniHtmlWebpackPlugin({
      filename: 'demo.html',
      publicPath: 'demo/',
      // `context` is available in `template` below
      context: {
        title: 'Webpack demo',
        htmlAttributes: { lang: 'en' },
        cssAttributes: { rel: 'preload' },
        jsAttributes: { defer: 'defer' }
      },
      template: ({
        css,
        js,
        publicPath,
        title,
        htmlAttributes,
        cssAttributes,
        jsAttributes
      }) => {
        const htmlAttrs = generateAttributes(htmlAttributes);

        const cssTags = generateCSSReferences({
          files: css,
          publicPath,
          cssAttributes: generateAttributes(cssAttributes)
        });

        const jsTags = generateJSReferences({
          files: js,
          publicPath,
          jsAttributes: generateAttributes(jsAttributes)
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
    })
  ]
};
```

## License

MIT.
