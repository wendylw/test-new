import React from 'react';
import { render } from 'react-dom';
import { destroyTarget } from '../utils';
import Alert from './Alert';
import '../Feedback.scss';

export const standardAlertContent = (title, description) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <>
    {title ? <h4 className="padding-small text-size-biggest text-weight-bolder">{title}</h4> : null}
    {description ? <p className="modal__text  padding-top-bottom-small">{description}</p> : null}
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

  render(
    React.createElement(Alert, {
      content,
      ...otherOptions,
      onClose: async () => {
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
