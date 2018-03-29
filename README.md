# mini-html-webpack-plugin - A miniature version of html-webpack-plugin with less functionality

The plugin writes CSS and JS asset paths for you automatically. You can also override most of it. It does **not** work with html-webpack-plugin plugins!

## Usage

```
npm install mini-html-webpack-plugin
```

```javascript
const MiniHtmlWebpackPlugin = require("mini-html-webpack-plugin");

const config = {
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title: "Webpack demo", // Available in the context below
      },
      filename: 'demo.html', // Optional, defaults to `index.html`
    }),
  ],
};
```

## How to Minify HTML?

```javascript
const minify = require("html-minifier").minify;
const MiniHtmlWebpackPlugin = require("mini-html-webpack-plugin");

const config = {
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title: "Minification demo",
      },
      template: context => minify(
        MiniHtmlWebpackPlugin.defaultTemplate(context)
      ),
    }),
  ],
};
```

## Custom Templates

Use [@vxna/mini-html-webpack-template](https://www.npmjs.com/package/@vxna/mini-html-webpack-template) to add an app container div, a favicon, meta tags, inline JavaScript or CSS.

Or define a template function to generate your own code:

```js
const MiniHtmlWebpackPlugin = require("mini-html-webpack-plugin");
const { generateCSSReferences, generateJSReferences } = MiniHtmlWebpackPlugin;

const config = {
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title: "Custom template",
      },
      template: ({ css, js, title, publicPath }) => (
        `<!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>${title}</title>
              ${generateCSSReferences(css, publicPath)}
            </head>
            <body>
              <div id="app"></div>
              ${generateJSReferences(js, publicPath)}
            </body>
          </html>`
      ),
    }),
  ],
};
```

## License

MIT.
