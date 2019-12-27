import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'whatwg-fetch';
import './config'; // import here for globally init
import './i18n';
import './utils/polyfill';

import Bootstrap from './Bootstrap';
import HeapJS from './components/HeapJS';

import './index.css';

ReactDOM.render(
  <HeapJS>
    <Bootstrap />
  </HeapJS>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
