import React from 'react';
// import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { destroyTarget } from '../utils';
import Alert from './FullScreen';
import '../Feedback.scss';

const STATUS_LIST = ['error', 'warning', 'info', 'success'];

const normalizeFullScreenOptions = options => ({
  container: document.body,
  show: true,
  title: null,
  content: null,
  buttons: [],
  closeButtonContent: null,
  className: '',
  style: {},
  onClose: () => {},
  ...options,
});
const createFullScreen = (status, options) =>
  new Promise(resolve => {
    const { container, onClose, ...restOptions } = options;
    const rootDOM = document.createElement('div');

    rootDOM.setAttribute('class', 'feedback__container fixed-wrapper');
    container.appendChild(rootDOM);

    const alertInstance = React.createElement(Alert, {
      status,
      ...restOptions,
      onClose: () => {
        render(React.cloneElement(alertInstance, { show: false }), rootDOM, () => {
          destroyTarget(rootDOM);
          onClose();
          resolve();
        });
      },
    });

    render(alertInstance, rootDOM);
  });

export const fullScreen = (status, options = {}) => createFullScreen(status, normalizeFullScreenOptions(options));
