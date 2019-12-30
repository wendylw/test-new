/* Disable minification (remove `.min` from URL path) for more info */
/* eslint-disable no-restricted-globals */
const script = document.createElement('script');

script.src = 'https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en,Intl.~locale.th';
script.async = true;

document.body.appendChild(script);

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
/* eslint-enabled no-restricted-globals */
