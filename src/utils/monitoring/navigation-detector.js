/* eslint-disable no-var, prefer-rest-params */
// Refer to: https://stackoverflow.com/a/52809105/1861937
const { history } = window;
if (history) {
  history.pushState = (f =>
    function pushState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new CustomEvent('sh-pushstate'));
      window.dispatchEvent(new CustomEvent('sh-location-change'));
      return ret;
    })(history.pushState);

  history.replaceState = (f =>
    function replaceState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new CustomEvent('sh-replacestate'));
      window.dispatchEvent(new CustomEvent('sh-location-change'));
      return ret;
    })(history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new CustomEvent('sh-location-change'));
  });
}

export {};
