import React from 'react';
import { render } from 'react-dom';
import i18next from 'i18next';
import { destroyTarget } from '../utils';
import Alert from './Alert';
import '../Feedback.scss';

export const formatAlertContent = (title, description) => {
  const { key: titleKey, options: titleOptions } = title;
  const { key: descriptionKey, options: descriptionOptions } = description;

  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <>
      {titleKey ? (
        <h4 className="padding-small text-size-biggest text-weight-bolder">
          {i18next.t(titleKey, titleOptions || {})}
        </h4>
      ) : null}
      {descriptionKey ? (
        <p className="modal__text  padding-top-bottom-small">{i18next.t(descriptionKey, descriptionOptions || {})}</p>
      ) : null}
    </>
  );
};

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
