// import { createPolyfill } from './polyfill';
import { JSDOM } from 'jsdom';

describe('Create polyfill link', () => {
  const dom = new JSDOM();
  let polyfillLink = '';
  let polyfillFile = null;

  beforeAll(() => {
    global.document = dom.window.document;
    global.window = dom.window;
    polyfillFile = require('./polyfill');
    polyfillLink = 'https://cdn.polyfill.io/v3/polyfill.min.js?features=Intl.~locale.en,Intl.~locale.th';
  });

  it('Polyfill script link created successfully', () => {
    jest.spyOn(document.body, 'appendChild');

    polyfillFile.createPolyfill();

    expect(document.body.appendChild).toBeCalledWith(expect.objectContaining({ src: polyfillLink }));
  });
});

describe('Compatible with Object.values in older browsers', () => {});
