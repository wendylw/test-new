const collectCoverageFrom = [
  // Freedom area
  '!src/**/__fixtures__/**/*',

  // Root
  // << do not collection root folder's coverage for now >>
  'src/config.js',

  // UI Components
  // << do not collect UI coverage for now >>

  // Utils
  'src/utils/**/*.js',
  '!src/utils/url.js',
  '!src/utils/propTypes.js',

  // Redux
  'src/redux/**/*.js',
  'src/{cashback,ordering,stores}/redux/**/*.js',
];

module.exports = config => {
  const overrides = {
    collectCoverageFrom,
    coverageThreshold: {
      'src/utils': {
        branches: 70,
        functions: 85,
        lines: 82,
        statements: 82
      },
      // TODO: add 'src/redux' if done with test cases
      // TODO: add 'src/{cashback,ordering,qrscan,stores}/redux' if done with test cases
      // TODO: add 'global' if needed, but not for now we think.
    },
  };
  return {
    ...config,
    ...overrides
  };
};
