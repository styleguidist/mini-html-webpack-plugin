# mini-html-webpack-plugin - A miniature version of html-webpack-plugin with less functionality

The plugin writes CSS and JS asset paths for you automatically. You can also override most of it. It does **not** work with html-webpack-plugin plugins!

**Usage:**

```javascript
new HtmlWebpackPluginLite({
  context: {
    title: "Webpack demo", // Available in the context below
  },
  template: ({ css, js, title }) => ... return html ... // Optional
  filename: 'demo.html', // Optional, defaults to `index.html`
}),
```
