import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { destroyTarget } from '../utils';
import Alert from './Alert';
import '../Feedback.scss';

const AlertStandardContent = ({ content, title }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <>
    {title ? <h4 className="padding-small text-size-biggest text-weight-bolder">{title}</h4> : null}
    {content ? <div className="padding-top-bottom-small">{content}</div> : null}
  </>
);
AlertStandardContent.displayName = 'AlertStandardContent';
AlertStandardContent.propTypes = {
  content: PropTypes.node,
  title: PropTypes.string,
};
AlertStandardContent.defaultProps = {
  content: null,
  title: null,
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
  const { container, onClose, ...restOptions } = options;
  const rootDOM = document.createElement('div');

  rootDOM.setAttribute('class', 'feedback__container fixed-wrapper');
  container.appendChild(rootDOM);

  const alertInstance = React.createElement(Alert, {
    content,
    ...restOptions,
    onClose: async () => {
      await onClose();
      render(React.cloneElement(alertInstance, { show: false }), rootDOM, () => destroyTarget(rootDOM));
    },
  });

  render(alertInstance, rootDOM);
};

export const alert = (content, options = {}) => {
  const { title, ...restOptions } = options;

  createAlert(<AlertStandardContent content={content} title={title} />, normalizeAlertOptions(restOptions));
};

alert.promise = (content, options = {}) =>
  new Promise(resolve => {
    const { onClose } = options;

    alert(content, {
      ...options,
      onClose: () => {
        resolve(onClose);
      },
    });
  });

alert.raw = (content, options = {}) => createAlert(content, normalizeAlertOptions(options));

alert.rawPromise = (content, options = {}) =>
  new Promise(resolve => {
    const { onClose } = options;

    alert.raw(content, {
      ...options,
      onClose: () => {
        resolve(onClose);
      },
    });
  });
