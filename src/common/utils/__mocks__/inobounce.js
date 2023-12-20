const iNoBounce = require('inobounce');

jest.mock('inobounce', () => ({
  disable: jest.fn(),
}));

export default iNoBounce;
