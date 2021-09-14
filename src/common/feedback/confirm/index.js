import React from 'react';
import ReactDOM from 'react-dom';
import { destroyTarget } from '../utils';
import Confirm from './Confirm';

const normalizeConfirmOptions = options => ({
  closeContent: null,
  okContent: null,
  className: '',
  container: document.body,
  style: {},
  onClose: () => {},
  onOk: () => {},
  ...options,
});
const createConfirmFeedback = (content, options) => {
  const { container, onClose, onOk, ...otherOptions } = options;
  const rootDOM = document.createElement('div');

  rootDOM.setAttribute('class', 'confirm-container');
  (container || document.body).appendChild(rootDOM);

  ReactDOM.render(
    React.createElement(Confirm, {
      content,
      ...otherOptions,
      onClose: async () => {
        await onClose();
        destroyTarget(rootDOM);
      },
      onOk: async () => {
        await onOk();
        destroyTarget(rootDOM);
      },
    }),
    rootDOM
  );
};

export function confirm(content, options = {}) {
  createConfirmFeedback(content || null, normalizeConfirmOptions(options));
}
