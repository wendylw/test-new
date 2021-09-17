import React from 'react';
import { render } from 'react-dom';
import { destroyTarget } from '../utils';
import Alert from './Alert';
import '../Feedback.scss';

const alertStandardContent = (content, title) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <>
    {title ? <h4 className="padding-small text-size-biggest text-weight-bolder">{title}</h4> : null}
    {content ? <p className="padding-top-bottom-small">{content}</p> : null}
  </>
);

const normalizeAlertOptions = options => ({
  container: document.body,
  show: true,
  closeButtonContent: null,
  className: '',
  style: {},
  onClose: () => {},
  ...options,
});
const createAlert = (content, options) => {
  const { container, onClose, ...otherOptions } = options;
  const rootDOM = document.createElement('div');

  rootDOM.setAttribute('class', 'feedback__container fixed-wrapper');
  container.appendChild(rootDOM);

  const alertInstance = React.createElement(Alert, {
    content,
    ...otherOptions,
    onClose: async () => {
      await onClose();
      render(React.cloneElement(alertInstance, { show: false }), rootDOM, () => destroyTarget(rootDOM));
    },
  });

  render(alertInstance, rootDOM);
};

export const alert = (content, options = {}) => createAlert(content || null, normalizeAlertOptions(options));

alert.raw = (content, options = {}) => {
  const { title } = options;

  createAlert(alertStandardContent(content, title), normalizeAlertOptions(options));
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

promiseAlert.raw = (content, options = {}) =>
  new Promise(resolve => {
    const { onClose } = options;

    alert.raw(content, {
      ...options,
      onClose: () => {
        resolve(onClose);
      },
    });
  });
