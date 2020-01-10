import { createPolyfill } from './polyfill';

describe('Create polyfill link', () => {
  it('Polyfill script link created successfully', () => {
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

// describe('Compatible with Object.values in older browsers', () => {
//   let testObject = null;
//   let testResult = [];

//   beforeAll(() => {
//     testObject = {
//       key1: 'value1',
//       key2: 'value2',
//     };
//     testResult = ['value1', 'value2'];
//   });

//   it('Object.values is working when window does not defines Object.values', () => {
//     global.window.Object.values = undefined;
//     expect(global.window.Object.values).toBeUndefined();

//     objectValuesPolyfill();

//     expect(window.Object.values(testObject)).toEqual(expect.arrayContaining(testResult));
//   });
// });
