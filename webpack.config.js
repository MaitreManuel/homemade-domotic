const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const DotEnv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');
const webpack = require('webpack');

const nodeModules = path.resolve(__dirname, 'node_modules');

const config = {
  cache: true,
  devtool: 'source-map',
  entry: { // Fichier de dev
    app: [
      './assets/main.js'
    ]
  },
  output: { // Assets construites (en mode production ou developpement suivant l'environnement) à partir des fichiers de dev
    chunkFilename: '[name]-[chunkhash].js',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    path: path.resolve('./html/dist')
  },
  module: {
    rules: [
      {
        // Requis pour la syntaxe JavaScript ES6
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env']
          }
        }
      }, {
        // Requis pour faire du Vue.js
        test: /\.vue$/,
        exclude: /node_modules/,
        use: {
          loader: 'vue-loader'
        }
      }, {
        // Requis pour importer du SASS/SCSS en JS
        test: /\.s(a|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          }, {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true
            }
          }, {
            loader: 'resolve-url-loader',
            options: {
              attempts: 1,
              sourceMap: true
            }
          }, {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [
                  // path.resolve(resources, '/build/'),
                  // path.resolve(resources, '/vad/'),
                  nodeModules
                ]
              },
              sourceMap: true
            }
          }
        ]
      }, {
        // Requis pour importer du CSS dans du JS
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          }, {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          }, {
            loader: 'resolve-url-loader',
            options: {
              attempts: 1,
              sourceMap: true
            }
          }
        ]
      }, {
        // Utilisé pour les icônes Bootstrap
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          prefix: 'font/',
          limit: 5000,
          mimetype: 'application/font-woff'
        }
      }, {
        test: /\.(ttf|eot|svg|otf|gif)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          prefix: 'font/'
        }
      }, {
        // Requis pour supporter les images dans du style
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 30000,
              name: '[name].[ext]?[hash]'
            }
          }
        ]
      }, {
        test: /\.(mp3|ogg|aac|flac)$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          chunks: 'all',
          minSize: 0,
          name: 'custom_vendors',
          test: /[\\/]assets[\\/]custom-libs[\\/]/
        },
        vendor: {
          chunks: 'all',
          name: 'node_vendors',
          test: /[\\/]node_modules[\\/]/
        }
      }
    }
  },
  plugins: [
    // Arrête de recharger s'il y a une erreur évitant un Red Screen Of Death
    new webpack.NoEmitOnErrorsPlugin(),
    // Nettoie la console avant l'affichage du build
    new CleanTerminalPlugin(),
    // Accède au fichier .env en front
    new DotEnv(),
    new VueLoaderPlugin()
  ],
  resolve: {
    // Permet de simplifier l'appelle d'une ressource
    alias: {
      Components: path.resolve('assets', 'vue/_components'),
      Libs: path.resolve('assets', 'custom-libs'),
      Module: path.resolve('assets', 'modules_static'),
      jquery: path.resolve('node_modules', 'jquery/jquery.min.js'),
      jQuery: path.resolve('node_modules', 'jquery/jquery.min.js')
    }
  }
};

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stats') { // Si je fais un build pour la Prod
  if (process.env.NODE_ENV === 'stats') {
    // Permet de visualiser de manière graphique la taille que prend chaque bundle
    config.plugins.push(
      new BundleAnalyzerPlugin()
    );
  }
  config.devtool = false;
  config.optimization.minimize = true;
  config.optimization.minimizer = [
    // Minifie et uglyfie le CSS pour qu'il prenne moins de place
    new CssMinimizerPlugin(),
    // Minifie et uglyfie le JS pour qu'il prenne moins de place
    new TerserPlugin({
      terserOptions: {
        ecma: 6,
        ie8: false,
        module: false,
        output: {
          beautify: false,
          comments: false
        },
        sourceMap: false
      }
    })
  ];
  config.optimization.nodeEnv = 'production';
  config.optimization.splitChunks.cacheGroups.styles = {
    chunks: 'all',
    enforce: true,
    name: 'node_vendors',
    test: /\.css$/
  };

  // On rajoute des plugins à faire
  config.plugins.push(
    // Permet de séparer le CSS importé dans du JS dans un fichier transpilé CSS
    new MiniCssExtractPlugin({
      chunkFilename: '[name].css',
      filename: '[name].css'
    }),
    // Compresse les fichiers, si le débit internet est trop lent, le client va télécharger
    // les .*.br et les décompresser
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      compressionOptions: {
        level: 11
      },
      deleteOriginalAssets: false,
      filename: '[base].br',
      minRatio: 0.8,
      test: /\.(js|css|html|svg|ttf|eot|otf|woff|woff2|ico)$/,
      threshold: 10240
    })
  );
} else {
  config.plugins.push(
    // Rajoute un plugin pour débug plus facilement une erreur de configuration
    new webpack.LoaderOptionsPlugin({
      debug: false
    }),
    // Permet de séparer le CSS importé dans du JS dans un fichier transpilé CSS
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  );
}

module.exports = config;
