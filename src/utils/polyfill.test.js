import { createPolyfill } from './polyfill';

describe('utils/polyfill', () => {
  it('createPolyfill:  should append a polyfill script link to body DOM', () => {
    const polyfillLink =
      'https://cdn.polyfill.io/v3/polyfill.min.js?features=Object.values%2CIntl.~locale.en,Intl.~locale.th';
    jest.spyOn(global.document.body, 'appendChild');

    createPolyfill();

    expect(global.document.body.appendChild).toBeCalledWith(
      expect.objectContaining({
        src: polyfillLink,
        async: true,
        crossorigin: 'anonymous',
      })
    );
  });
});