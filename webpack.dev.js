var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require("path");
var devport = 6004;

var config = {
    entry: [
        'webpack-dev-server/client?http://dev.broltes.com:' + devport,
        'webpack/hot/only-dev-server',
        'babel-polyfill',
        './demos/app.jsx',
    ],
    output: {
        path: path.join(__dirname, "demos"),
        filename: 'app.js'
    },
    plugins: [
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
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
                    'react-hot',
                    'babel?presets[]=react,presets[]=es2015',
                ]
            },{
                test: /\.less$/,
                loaders: [
                    'style',
                    'css?sourceMap',
                    'postcss',
                    'less?sourceMap'
                ]
            }
        ]
    },

    postcss: function () {
        return [
            require('autoprefixer')({ browsers: ["Android >= 4", "iOS >= 7"]}),
        ];
    },

    devtool: 'eval',
};

var compiler = webpack(config);
new WebpackDevServer(compiler, {
    contentBase: 'demos',
    hot: true,
    noInfo: true
}).listen(devport);
