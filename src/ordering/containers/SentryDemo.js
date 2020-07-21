import React from 'react';
import { get } from '../../utils/request';
import * as Sentry from '@sentry/react';

function xhr(method, url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      callback && callback(xhr.responseText);
    }
  };
  xhr.open(method, url);
  xhr.send();
}

const triggerSyncError = () => {
  const a = {};
  a.func();
};
const triggerAsyncError = () => {
  setTimeout(() => {
    const b = {};
    b.func();
  });
};
const triggerPromiseError = async () => {
  get('/bbbb');
};
const triggerCaughtError = async () => {
  try {
    await Promise.reject(new Error('example error'));
  } catch (e) {
    Sentry.captureException(e);
  }
};
const triggerXHRError = async () => {
  xhr('get', '/api/ccccd');
};
const triggerFetchError = async () => {
  try {
    await fetch('http://lkjlkjlkj');
  } catch {
    console.log('caught');
  }
};

const triggerConsoleError = () => {
  console.error('ConsoleError');
  console.warn('ConsoleWarning');
};

export default props => {
  return (
    <ul>
      <li>
        <button onClick={triggerSyncError}>sync error</button>
      </li>
      <li>
        <button onClick={triggerAsyncError}>async error</button>
      </li>
      <li>
        <button onClick={triggerPromiseError}>Promise error</button>
      </li>
      <li>
        <button onClick={triggerCaughtError}>caught error</button>
      </li>
      <li>
        <button onClick={triggerConsoleError}>Console error</button>
      </li>
      <li>
        <button onClick={triggerXHRError}>XHR error</button>
      </li>
      <li>
        <button onClick={triggerFetchError}>Fetch error</button>
      </li>
    </ul>
  );
};
