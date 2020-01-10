import Constants from './constants';
/* Disable minification (remove `.min` from URL path) for more info */
/* eslint-disable no-restricted-globals */

/* polyfill URL: https://polyfill.io/v3/url-builder/ */
export const createPolyfill = () => {
  const script = document.createElement('script');

  const IntlStr = Constants.LANGUAGES.map(lang => `Intl.~locale.${lang}`).join(',');
  const featuresArray = Constants.POLYFILL_FEATURES.filter(f => f !== 'Intl');

  featuresArray.push(IntlStr);

  script.src = `${Constants.POLYFILL_FEATURES_URL}${featuresArray.join('%2C')}`;
  script.async = true;
  script.crossorigin = 'anonymous';

  document.body.appendChild(script);
};

createPolyfill();

// export const objectValuesPolyfill = () => {
//   if (!Object.values) {
//     Object.values = function (obj) {
//       if (obj !== Object(obj)) {
//         throw new TypeError('Object.values called on a non-object');
//       }

//       const value = [];

//       for (let key in obj) {
//         if (Object.prototype.hasOwnProperty.call(obj, key)) {
//           value.push(obj[key]);
//         }
//       }

//       return value;
//     };
//   }
// };

// objectValuesPolyfill();

/* eslint-enabled no-restricted-globals */
