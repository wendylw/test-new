import React from 'react';
import { render } from 'react-dom';
import { destroyTarget } from '../utils';
import Toast from './Toast';
import '../Feedback.scss';

const normalizeToastOptions = options => ({
  container: document.body,
  icon: null,
  type: null,
  duration: 4500,
  show: true,
  className: '',
  style: {},
  onClose: () => {},
  ...options,
});
const createToast = (content, options) =>
  new Promise(resolve => {
    const { container, onClose, ...restOptions } = options;
    const rootDOM = document.createElement('div');

    rootDOM.setAttribute('class', 'feedback__container-toast');
    container.appendChild(rootDOM);

    // eslint-disable-next-line react/no-children-prop
    const toastInstance = React.createElement(
      Toast,
      {
        ...restOptions,
        onClose: () => {
          render(React.cloneElement(toastInstance, { show: false }), rootDOM);
          destroyTarget(rootDOM);
          resolve();
          onClose();
        },
      },
      content
    );

    render(toastInstance, rootDOM);
  });

export const toast = (content, options = {}) => createToast(content, normalizeToastOptions(options));
