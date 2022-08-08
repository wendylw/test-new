import 'whatwg-fetch';
import './utils/monitoring/monitor';
import './utils/monkey-patches';
import './utils/polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import smoothscroll from 'smoothscroll-polyfill';
import resizeObserverPolyfill from 'resize-observer-polyfill';
import './i18n';
import Bootstrap from './Bootstrap';
import './index.css';

try {
  // kick off the polyfill!
  smoothscroll.polyfill();

  if (!window.ResizeObserver) {
    window.ResizeObserver = resizeObserverPolyfill.default;
  }
} catch (e) {
  throw e;
} finally {
  ReactDOM.render(<Bootstrap />, document.getElementById('root'));
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
