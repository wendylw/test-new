import { isURL, getUUID } from './index';

describe('isURL', () => {
  it('should return true if url is valid', () => {
    expect(isURL('https://www.google.com')).toBe(true);
  });
  // TODO: not sure this logic is correct? https://www is true, but https:// is false
  it('should return false if url is invalid', () => {
    expect(isURL('https://')).toBe(false);
  });
});

describe('test getUUID function', () => {
  let windowSpy;

  const expectedUUID = 'fce2af57-3610-48f1-bbfb-bc0d72213718';
  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  // By default, window.crypto is not available on jsdom
  it('should return expected UUID', () => {
    windowSpy.mockImplementation(() => ({
      crypto: {
        randomUUID: () => expectedUUID,
      },
    }));

    expect(window.crypto.randomUUID()).toEqual(expectedUUID);
  });

  test('return uuid when window.crypto is available', () => {
    expect(getUUID()).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  });

  test('return uuid when window.crypto is not available', () => {
    windowSpy.mockImplementation(() => ({
      crypto: undefined,
    }));
    expect(window.crypto).toBeUndefined();
    expect(getUUID()).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  });
});
