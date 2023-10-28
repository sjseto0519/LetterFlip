const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || [];
const when = (condition, config, negativeConfig) =>
  condition ? ensureArray(config) : ensureArray(negativeConfig);

// primary config:
const outDir = path.resolve(__dirname, project.platform.output);
const srcDir = path.resolve(__dirname, 'src');
const baseUrl = '/';

const cssRules = [
  {
    loader: 'css-loader'
  },
  {
    loader: 'postcss-loader', // Add this line
    options: {
      postcssOptions: {
        config: path.resolve(__dirname, 'postcss.config.js'),
      },
    },
  }
];


module.exports = ({ production }, { analyze, hmr, port, host }) => ({
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [srcDir, 'node_modules'],

    alias: {
      // https://github.com/aurelia/dialog/issues/387
      // Uncomment next line if you had trouble to run aurelia-dialog on IE11
      // 'aurelia-dialog': path.resolve(__dirname, 'node_modules/aurelia-dialog/dist/umd/aurelia-dialog.js'),

      // https://github.com/aurelia/binding/issues/702
      // Enforce single aurelia-binding, to avoid v1/v2 duplication due to
      // out-of-date dependencies on 3rd party aurelia plugins
      'aurelia-binding': path.resolve(__dirname, 'node_modules/aurelia-binding')
    }
  },
  entry: {
    app: [
      // Uncomment next line if you need to support IE11
      // 'promise-polyfill/src/polyfill',
      'main.css',
      'aurelia-bootstrapper'
    ]
  },
  mode: production ? 'production' : 'development',
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? '[name].[chunkhash].bundle.js' : '[name].[fullhash].bundle.js',
    chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[fullhash].chunk.js'
  },
  optimization: {
    runtimeChunk: true,  // separates the runtime chunk, required for long term cacheability
    // moduleIds is the replacement for HashedModuleIdsPlugin and NamedModulesPlugin deprecated in https://github.com/webpack/webpack/releases/tag/v4.16.0
    // changes module id's to use hashes be based on the relative path of the module, required for long term cacheability
    moduleIds: 'deterministic',
    // Use splitChunks to breakdown the App/Aurelia bundle down into smaller chunks
    // https://webpack.js.org/plugins/split-chunks-plugin/
    splitChunks: {
      cacheGroups: {
        default: false, // Disable the default behavior of splitting all vendors
        vendors: false, // Disable the default vendors behavior
        aurelia: {
          test: /[\\/]node_modules[\\/]aurelia[-\w]*[\\/]/, // Matches 'aurelia' and any characters that follow until a slash
          name: 'aurelia', // Name of the new chunk
          chunks: 'all', // Selects both 'initial' and 'async' chunks
          priority: 21, // Make this cache group a higher priority
          enforce: true // Force the creation of this chunk
        },
        babyloncore: { // Create a cache group just for BabylonJS
          test: /[\\/]node_modules[\\/]@babylonjs[\\/]core[\\/]/, // Test to pick BabylonJS modules
          name: 'babylon-core', // Name of the new chunk
          chunks: 'all', // Selects both 'initial' and 'async' chunks
          priority: 20, // Make this cache group a higher priority
        },
        babylongui: { // Create a cache group just for BabylonJS
          test: /[\\/]node_modules[\\/]@babylonjs[\\/]gui[\\/]/, // Test to pick BabylonJS modules
          name: 'babylon-gui', // Name of the new chunk
          chunks: 'all', // Selects both 'initial' and 'async' chunks
          priority: 20, // Make this cache group a higher priority
        },
        babylonhavok: { // Create a cache group just for BabylonJS
          test: /[\\/]node_modules[\\/]@babylonjs[\\/]havok[\\/]/, // Test to pick BabylonJS modules
          name: 'babylon-havok', // Name of the new chunk
          chunks: 'all', // Selects both 'initial' and 'async' chunks
          priority: 20, // Make this cache group a higher priority
        },
         // Group for synchronous (or "initial") chunks
         vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'initial',  // Only target initial chunks
          priority: 19,
          enforce: true,      // Causes maxInitialRequests to be ignored; minSize is still respected
        },
      }
    }
  },
  performance: { hints: false },
  devServer: {
    // serve index.html for all 404 (required for push-state)
    historyApiFallback: true,
    open: project.platform.open,
    hot: hmr || project.platform.hmr,
    port: port || project.platform.port,
    host: host
  },
  devtool: production ? undefined : 'cheap-module-source-map',
  module: {
    rules: [
      // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      {
        test: /\.css$/i,
        issuer: { not: [ /\.html$/i ] },
        use: [ { loader: MiniCssExtractPlugin.loader }, ...cssRules ]
      },
      {
        test: /\.css$/i,
        issuer: /\.html$/i,
        // CSS required in templates cannot be extracted safely
        // because Aurelia would try to require it again in runtime
        use: cssRules
      },
      // Skip minimize in production build to avoid complain on unescaped < such as
      // <span>${ c < 5 ? c : 'many' }</span>
      { test: /\.html$/i, loader: 'html-loader', options: { minimize: false } },
      { test: /\.ts$/, loader: "ts-loader" },
      // embed small images and fonts as Data Urls and larger ones as files:
      { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset' },
      { test: /\.(woff|woff2|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i,  type: 'asset' },
      { test: /environment\.json$/i, use: [
        {loader: "app-settings-loader", options: {env: production ? 'production' : 'development' }},
      ]}
    ]
  },
  plugins: [
    new DuplicatePackageCheckerPlugin(),
    new AureliaPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      metadata: {
        // available in index.ejs //
        baseUrl
      }
    }),
    // ref: https://webpack.js.org/plugins/mini-css-extract-plugin/
    new MiniCssExtractPlugin({ // updated to match the naming conventions for the js files
      filename: production ? '[name].[contenthash].bundle.css' : '[name].[fullhash].bundle.css',
      chunkFilename: production ? '[name].[contenthash].chunk.css' : '[name].[fullhash].chunk.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static', to: outDir, globOptions: { ignore: ['.*'] } }
      ]
    }), // ignore dot (hidden) files
    ...when(analyze, new BundleAnalyzerPlugin()),
    /**
     * Note that the usage of following plugin cleans the webpack output directory before build.
     * In case you want to generate any file in the output path as a part of pre-build step, this plugin will likely
     * remove those before the webpack build. In that case consider disabling the plugin, and instead use something like
     * `del` (https://www.npmjs.com/package/del), or `rimraf` (https://www.npmjs.com/package/rimraf).
     */
    new CleanWebpackPlugin()
  ]
});
