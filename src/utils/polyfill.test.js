import { createPolyfill, objectValuePolyfill } from './polyfill';
import { JSDOM } from 'jsdom';

const dom = new JSDOM();

describe('Create polyfill link', () => {
  let polyfillLink = '';

  beforeAll(() => {
    global.document = dom.window.document;
    polyfillLink = 'https://cdn.polyfill.io/v3/polyfill.min.js?features=Intl.~locale.en,Intl.~locale.th';
  });

  it('Polyfill script link created successfully', () => {
    jest.spyOn(document.body, 'appendChild');

    createPolyfill();

    expect(document.body.appendChild).toBeCalledWith(expect.objectContaining({ src: polyfillLink }));
  });
});

describe('Compatible with Object.values in older browsers', () => {
  beforeAll(() => {
    global.window = dom.window;
    testObject = {
      key1: 'value1',
      key2: 'value2',
    };
  });

  it('Object.values is working when window does not define Object.values', () => {});
});
