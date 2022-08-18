import React from 'react';
import { render } from 'react-dom';
import { destroyTarget, FEEDBACK_STATUS, TOAST_DEFAULT_DURATION } from './utils';
import Toast from '../../components/Toast';

const toastOptions = ({
  container = document.body,
  icon = null,
  type = FEEDBACK_STATUS.ERROR,
  duration = TOAST_DEFAULT_DURATION,
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

    rootDOM.setAttribute('class', 'feedback__toast');
    container.appendChild(rootDOM);

    render(toastInstance, rootDOM);
  });

export const toast = (content, options = {}) => createToast(content, toastOptions(options));

toast.error = (content, options = {}) =>
  createToast(content, toastOptions({ ...options, type: FEEDBACK_STATUS.ERROR }));
toast.success = (content, options = {}) =>
  createToast(content, toastOptions({ ...options, type: FEEDBACK_STATUS.SUCCESS }));
toast.warning = (content, options = {}) =>
  createToast(content, toastOptions({ ...options, type: FEEDBACK_STATUS.WARNING }));
toast.info = (content, options = {}) => createToast(content, toastOptions({ ...options, type: FEEDBACK_STATUS.INFO }));
