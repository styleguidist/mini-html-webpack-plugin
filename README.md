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
        htmlAttributes: {
          lang: 'en'
        },
        // Optional, any additional HTML attached within <head>
        head: '',
        // Optional, any additional HTML attached within <body>
        body: '',
        // Optional
        cssAttributes: {
          rel: 'preload',
          as: 'style'
        },
        // Optional
        jsAttributes: {
          defer: true
        }
      },
      // Optional, use this for choosing chunks to include to your page.
      // See the expanded example below.
      chunks: ['app']
    })
  ]
};
```

### Multiple pages

It's possible to use `MiniHtmlWebpackPlugin` to develop sites with multiple pages. It can be combined with webpack's bundle splitting so you can share common code across different pages.

To achieve this, you'll have to define `entry` against each the code for each page and define `MiniHtmlWebpackPlugin` to match them. In practice you might want to abstract this pairing but to give you the full idea, consider the example below.

```javascript
const MiniHtmlWebpackPlugin = require('mini-html-webpack-plugin');

const config = {
  entry: {
    app: './app.js',
    another: './another.js'
  },
  plugins: [
    new MiniHtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['app'],
    }),
    new MiniHtmlWebpackPlugin({
      filename: 'another.html',
      chunks: ['another'],
    },
  ],
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

Or define a template function to generate your own code.

The template function may return a string or a `Promise` resolving to a string.

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
        htmlAttributes: {
          lang: 'en'
        },
        cssAttributes: {
          rel: 'preload',
          as: 'style'
        },
        jsAttributes: {
          defer: true
        }
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
          attributes: cssAttributes,
          publicPath
        });

        const jsTags = generateJSReferences({
          files: js,
          attributes: jsAttributes,
          publicPath
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
