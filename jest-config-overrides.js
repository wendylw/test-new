const collectCoverageFrom = [
  // definition file won't be tested
  '!src/**/*.d.ts',

  // root dir
  'src/*.{ts,tsx,js,jsx}',
  '!src/index.tsx',
  '!src/serviceWorker.ts',
  '!src/setupTests.ts',

  // component should be tested eventually
  // 'src/components/**/*.{ts,tsx,js,jsx}',
  'src/components/ErrorScreen/index.tsx',
  'src/components/Link/index.tsx',

  // constants doesn't need to be tested
  '!src/constants/**/*.{ts,tsx,js,jsx}',

  // containers should be tested eventually
  // 'src/containers/**/*.{ts,tsx,js,jsx}',

  // redux should be tested eventually
  // 'src/redux/**/*.{ts,tsx,js,jsx}',

  // util should be tested except several non-logical components
  'src/utils/**/*.{ts,tsx,js,jsx}',
  '!src/utils/antd-icons.ts',
  '!src/utils/url.ts',
  '!src/utils/bootstrap/fontawesome.ts'
];

module.exports = config => {
  const overrides = {
    collectCoverageFrom,
    coverageThreshold: {
      'src/*.{ts,tsx,js,jsx}': {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50
      },
      'src/components/**/*.{ts,tsx,js,jsx}': {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50
      },
      'src/utils/**/*.{ts,tsx,js,jsx}': {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50
      }
    },
    moduleNameMapper: {
      // https://github.com/sindresorhus/ky/issues/170
      '^ky$': require.resolve('ky').replace('index.js', 'umd.js')
    }
  };
  return {
    ...config,
    ...overrides
  };
};
