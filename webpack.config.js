const path = require('path')
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const jsOut = './web/dst/'
const jsIn = './web/src/js/'

const cssOut = './web/dst/'
const cssIn = './web/src/css/'

module.exports = {
    entry: {
        index: jsIn + 'index.js',
    },
    output: {
        path: path.resolve(__dirname, jsOut + 'js'),
        filename: '[name].js'
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '../css/[name].css'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: true,
                    }
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        js: 'babel-loader'
                    }
                }
            },
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            injectType: 'singletonStyleTag',
                            attributes: {
                                'data-cke': true
                            }
                        }
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: styles.getPostCssConfig( {
                                themeImporter: {
                                    themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
                                },
                                // minify: true
                            })
                        }
                    },
                ]
            },
            {
                test: /\.(css)$/,
                exclude: [
                    /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
                ],
                use: [
                    MiniCssExtractPlugin.loader,
                    'style-loader',
                    'css-loader',
                ]
            },
            {
                test: /\.(sc|sa)ss$/,
                exclude: [
                    /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
                ],
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.(jpg|jpeg|gif|png)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        publicPath: 'images',
                        outputPath: 'images',
                    }
                }
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        publicPath: 'fonts',
                        outputPath: 'fonts',
                    }
                }
            },
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                use: [ 'raw-loader' ]
            },
            {
                test: /\.(otf|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                exclude: [
                    /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                    /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/,
                ],
                use: {
                    loader: 'url-loader',
                }
            },
        ]
    },
}