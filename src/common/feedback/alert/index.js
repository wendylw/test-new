import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { destroyTarget } from '../utils';
import Alert from './Alert';
import '../Feedback.scss';

const AlertStandardContent = ({ content, title }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <>
    {title ? <h4 className="alert__title padding-small text-size-biggest text-weight-bolder">{title}</h4> : null}
    {content ? (
      <div className="alert__description padding-top-bottom-small text-line-height-base">{content}</div>
    ) : null}
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
const createAlert = (content, options) =>
  new Promise(resolve => {
    const { container, onClose, ...restOptions } = options;
    const rootDOM = document.createElement('div');

    rootDOM.setAttribute('class', 'feedback__container fixed-wrapper');
    container.appendChild(rootDOM);

    // Because history.back (which is called when the modal is closed) is an async method, we have to wait
    // the url to be actually changed. Otherwise, there will be problem if the onClose callback contains
    // logic to change the url.
    const onModalHashChanged = show => {
      if (!show) {
        destroyTarget(rootDOM);
        resolve();
        onClose();
      }
    };

    const alertInstance = React.createElement(Alert, {
      content,
      ...restOptions,
      onClose: () => {
        render(React.cloneElement(alertInstance, { show: false, onModalHashChanged }), rootDOM);
      },
    });

    render(alertInstance, rootDOM);
  });

export const alert = (content, options = {}) => {
  const { title, ...restOptions } = options;

  return createAlert(<AlertStandardContent content={content} title={title} />, normalizeAlertOptions(restOptions));
};

alert.raw = (content, options = {}) => createAlert(content, normalizeAlertOptions(options));