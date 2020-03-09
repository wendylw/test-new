import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'whatwg-fetch';
import config from './config';
import './i18n';

import Bootstrap from './Bootstrap';

import './index.css';

/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/iframe-has-title */
if (heap && heap.addUserProperties) {
  heap.addUserProperties({
    account: config.business,
  });
}

ReactDOM.render(<Bootstrap />, document.getElementById('root'));
/* eslint-enabled jsx-a11y/iframe-has-title */
/* eslint-enabled no-undef */

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
