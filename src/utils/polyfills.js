// NOTE: Only add a polyfill here if it's not included in polyfill.io.

// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onhashchange
if (!window.HashChangeEvent) {
  (function hashChangeEventPolyfill() {
    let lastURL = document.URL;
    window.addEventListener('hashchange', event => {
      Object.defineProperty(event, 'oldURL', { enumerable: true, configurable: true, value: lastURL });
      Object.defineProperty(event, 'newURL', { enumerable: true, configurable: true, value: document.URL });
      lastURL = document.URL;
    });
  })();
}
