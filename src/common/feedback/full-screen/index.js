import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { destroyTarget } from '../utils';
import FullScreen from './FullScreen';
import '../Feedback.scss';

const FullScreenStandardContent = ({ content, title }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <div className="padding-top-bottom-normal">
    {title ? <h4 className="padding-left-right-normal text-size-biggest text-weight-bolder">{title}</h4> : null}
    {content ? <div className="padding-top-bottom-normal">{content}</div> : null}
  </div>
);
FullScreenStandardContent.displayName = 'FullScreenStandardContent';
FullScreenStandardContent.propTypes = {
  content: PropTypes.node,
  title: PropTypes.string,
};
FullScreenStandardContent.defaultProps = {
  content: null,
  title: null,
};
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

    const fullScreenInstance = React.createElement(FullScreen, {
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

export const fullScreen = (status, options = {}) => {
  const { title, content, ...restOptions } = options;

  createFullScreen(
    status,
    normalizeFullScreenOptions({
      ...restOptions,
      content: <FullScreenStandardContent title={title} content={content} />,
    })
  );
};

fullScreen.raw = (status, options = {}) => createFullScreen(status, normalizeFullScreenOptions(options));
