import React from 'react';
import ReactDOM from 'react-dom';
import { destroyTarget } from '../utils';
import Alert from './Alert';

const normalizeAlertOptions = options => ({
  container: document.body,
  closeContent: null,
  className: '',
  style: {},
  onClose: () => {},
  ...options,
});
const createAlert = (content, options) => {
  const { container, onClose, ...otherOptions } = options;
  const rootDOM = document.createElement('div');

  rootDOM.setAttribute('class', 'alert-container');
  (container || document.body).appendChild(rootDOM);

  ReactDOM.render(
    React.createElement(Alert, {
      content,
      ...otherOptions,
      close: async () => {
        await onClose();
        destroyTarget(rootDOM);
      },
    }),
    rootDOM
  );
};

export const alert = (content, options = {}) => {
  createAlert(content || null, normalizeAlertOptions(options));
};

export const promiseAlert = (content, options = {}) =>
  new Promise(resolve => {
    const { onClose } = options;
    alert(content, {
      ...options,
      onClose: () => {
        resolve(onClose);
      },
    });
  });
