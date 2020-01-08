const path = require('path');
const { override, addLessLoader, addWebpackAlias } = require('customize-cra');
const jestConfig = require('./jest-config-overrides');

const customization = override(
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { '@font-family': "'Open Sans', sans-serif" }
  }),
  /**
   * reduce antd's icon size:
   * https://github.com/HeskeyBaozi/reduce-antd-icons-bundle-demo
   * https://github.com/ant-design/ant-design/issues/12011
   */
  addWebpackAlias({
    '@ant-design/icons/lib/dist$': path.resolve(__dirname, './src/utils/antd-icons.ts')
  })

  // fixBabelImports('import', {
  //   libraryName: 'antd',
  //   libraryDirectory: 'es',
  //   style: 'css'
  // })
);

// refer to docs on https://github.com/timarney/react-app-rewired
customization.jest = jestConfig;

module.exports = customization;
