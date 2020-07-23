// const path = require('path');

// function resolve(dir) {
//   return path.join(__dirname, dir);
// }
// module.exports = {
//   // lintOnSave: false,   // 关闭代码验证
//   chainWebpack: (config) => {
//     config.module
//       .rule('html')
//       .test(/\.html$/)
//       .use('html-loader')
//       .loader('html-loader')
//       .end();
//   },
//   configureWebpack: {
//     resolve: {
//       alias: {
//         vue$: 'vue/dist/vue.js',
//         $bc: 'src/*',
//         // 'bc$': path.resolve(__dirname, 'src'),
//       },
//     },
//   },
// }
const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  lintOnSave: false,
  chainWebpack: (config) => {
    config.resolve.alias
      .set('bc$', resolve('src'))
    // 这里只写了一个，你可以自己再加，按这种格式.set('', resolve(''))
  }
};