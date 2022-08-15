import React from 'react';
import { render } from 'react-dom';
import { destroyTarget } from './utils';
import Alert from '../../components/Alert';
import AlertContent from '../../components/Alert/AlertContent';

const alertOptions = options => ({
  container: document.body,
  show: true,
  customizeContent: false,
  animation: true,
  closeButtonContent: null,
  className: '',
  zIndex: 300,
  style: {},
  onClose: () => {},
  ...options,
});

const createAlert = (content, options) =>
  new Promise(resolve => {
    const { container, customizeContent, title, onClose, ...restOptions } = options;
    const rootDOM = document.createElement('div');
    // eslint-disable-next-line react/jsx-filename-extension
    const children = customizeContent ? content : <AlertContent content={content} title={title} />;
    const alertInstance = React.createElement(
      Alert,
      {
        title,
        ...restOptions,
        mountAtRoot: false,
        onClose: () => {
          destroyTarget(rootDOM);
          resolve();
          onClose();
        },
      },
      children
    );

    container.appendChild(rootDOM);

    render(alertInstance, rootDOM);
  });

export const alert = (content, options = {}) => createAlert(content, alertOptions(options));
