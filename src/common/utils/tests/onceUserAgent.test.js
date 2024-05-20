import { isSafari, isMobile } from '../index';

// Mock getUserAgentInfo to return a Safari browser
jest
  .spyOn(navigator, 'userAgent', 'get')
  .mockImplementation(
    () =>
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  );

describe('isSafari', () => {
  test('should return true when user agent is Safari', () => {
    expect(isSafari()).toBe(true);
  });
});

describe('isMobile', () => {
  test('should return true if user agent is mobile', () => {
    expect(isMobile()).toBe(true);
  });
});
