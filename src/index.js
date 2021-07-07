import 'whatwg-fetch';
import './utils/monitoring/monitor';
import './utils/monkey-patches';
import './utils/tng-bridge';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import smoothscroll from 'smoothscroll-polyfill';
import config from './config';
import './i18n';

import Bootstrap from './Bootstrap';

import './index.css';
import Utils from './utils/utils';

/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/iframe-has-title */
try {
  // kick off the polyfill!
  smoothscroll.polyfill();
} catch (e) {
  throw e;
} finally {
  ReactDOM.render(<Bootstrap />, document.getElementById('root'));
}

/* eslint-enabled jsx-a11y/iframe-has-title */
/* eslint-enabled no-undef */

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
