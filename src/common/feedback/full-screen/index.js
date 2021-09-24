import React from 'react';
// import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { destroyTarget } from '../utils';
import Alert from './FullScreen';
import '../Feedback.scss';

const FullScreenStandardContent = ({ content, title }) => {};

const normalizeFullScreenOptions = options => ({
  container: document.body,
  show: true,
  image: null,
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

    const fullScreenInstance = React.createElement(Alert, {
      status,
      ...restOptions,
      onClose: () => {
        render(React.cloneElement(fullScreenInstance, { show: false }), rootDOM, () => {
          destroyTarget(rootDOM);
          onClose();
          resolve();
        });
      },
    });

    render(fullScreenInstance, rootDOM);
  });

export const fullScreen = (status, options = {}) => createFullScreen(status, normalizeFullScreenOptions(options));
