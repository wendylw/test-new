import React from 'react';
import { render } from 'react-dom';
import { destroyTarget } from './utils';
import Toast from '../../components/Toast';

const normalizeToastOptions = ({
  container = document.body,
  icon = null,
  type = 'error',
  duration = 4500,
  className = '',
  style = {},
  onClose = () => {},
}) => ({
  container,
  icon,
  type,
  duration,
  className,
  style,
  onClose,
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
        show: true,
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
