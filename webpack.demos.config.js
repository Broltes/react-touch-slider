var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require("path");
var demoDist = '../github.io/tslider';

module.exports = {
    entry: [
        'babel-polyfill',
        './demos/app.jsx',
    ],
    output: {
        path: path.resolve(demoDist),
        filename: 'app.js'
    },
    plugins: [
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'demos/index.html')
        })
    ],
    resolve: {
        extensions: ['', '.js', '.jsx'],
        root: path.resolve('./src')
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: [
                    'babel?presets[]=react,presets[]=es2015',
                ]
            },{
                test: /\.less$/,
                loaders: [
                    'style',
                    'css',
                    'postcss',
                    'less'
                ]
            }, {
                test: /\.(png|jpg)$/,
                loader: 'url?limit=5000'
            }
        ]
    },

    postcss: function () {
        return [
            require('autoprefixer')({ browsers: ["Android >= 4", "iOS >= 7"]}),
        ];
    },
};
