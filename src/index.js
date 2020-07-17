/* eslint-disable import/first */
import * as Sentry from '@sentry/react';
// import { Integrations as ApmIntegrations } from '@sentry/apm';

Sentry.init({
  dsn: 'https://be399ca403c14a7ba5c785d60ac1716c@o420511.ingest.sentry.io/5338848',
});

import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'whatwg-fetch';
import smoothscroll from 'smoothscroll-polyfill';
import config from './config';
import './i18n';

import Bootstrap from './Bootstrap';

import './index.css';

/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/iframe-has-title */
try {
  // kick off the polyfill!
  smoothscroll.polyfill();

  if (heap && heap.addUserProperties) {
    heap.addUserProperties({
      account: config.business,
    });
  } else {
    throw new Error('heap or heap.addUserProperties not defined');
  }
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
