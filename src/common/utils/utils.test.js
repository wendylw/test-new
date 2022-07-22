import { isURL } from './index';

describe('isURL', () => {
  it('should return true if url is valid', () => {
    expect(isURL('https://www.google.com')).toBe(true);
  });
  it('should return false if url is invalid', () => {
    expect(isURL('https://www.google')).toBe(false);
  });
});
