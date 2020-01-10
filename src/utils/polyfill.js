import Constants from './constants';
/* Disable minification (remove `.min` from URL path) for more info */
/* eslint-disable no-restricted-globals */

/* polyfill URL: https://polyfill.io/v3/url-builder/ */
export const createPolyfill = () => {
  const script = document.createElement('script');

  const featuresArray = Constants.LANGUAGES.map(lang => `${Constants.POLYFILL_FEATURES.join('%2C')}.~locale.${lang}`);
  script.src = `${Constants.POLYFILL_FEATURES_URL}${featuresArray.join(',')}`;
  script.async = true;

  document.body.appendChild(script);
};

createPolyfill();

export const objectValuePolyfill = () => {
  if (!Object.values) {
    Object.values = function(obj) {
      if (obj !== Object(obj)) {
        throw new TypeError('Object.values called on a non-object');
      }

      const value = [];

      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          value.push(obj[key]);
        }
      }

      return value;
    };
  }
};

objectValuePolyfill();

/* eslint-enabled no-restricted-globals */
