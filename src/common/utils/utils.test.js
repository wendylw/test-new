import { isURL, getUUID } from './index';

describe('isURL', () => {
  it('should return true if url is valid', () => {
    expect(isURL('https://www.google.com')).toBe(true);
  });
  it('should return false if url is invalid', () => {
    expect(isURL('https://www.google')).toBe(false);
  });
});

describe('test getUUID function', () => {
  // By default, window.crypto is not available on jsdom
  Object.defineProperty(window, 'crypto', {
    randomUUID() {
      return 'fce2af57-3610-48f1-bbfb-bc0d72213718';
    },
  });

  test('return uuid when window.crypto is available', () => {
    expect(getUUID()).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  });

  const cryptoObj = window.crypto;

  test('return uuid when window.crypto is not available', () => {
    window.crypto = undefined;
    expect(getUUID()).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
    window.crypto = cryptoObj;
  });
});
