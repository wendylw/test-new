import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { FEEDBACK_STATUS, BUTTONS_STYLE_TYPES, destroyTarget } from '../utils';
import BeepError from '../../../images/beep-error.png';
import BeepWarning from '../../../images/beep-warning.png';
import FullScreen from './FullScreen';
import '../Feedback.scss';

const STATUS_IMAGE_MAPPING = {
  [FEEDBACK_STATUS.ERROR]: BeepError,
  [FEEDBACK_STATUS.WARNING]: BeepWarning,
  [FEEDBACK_STATUS.INFO]: BeepError,
  [FEEDBACK_STATUS.SUCCESS]: BeepWarning,
};
const FullScreenStandardContent = ({ status, image, content, title }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <div className="padding-top-bottom-normal">
    <figure className="full-screen__image-container margin-top-bottom-normal">
      <img src={image || STATUS_IMAGE_MAPPING[status]} alt={`beep ${status}`} />
    </figure>
    {title ? (
      <h4 className="padding-left-right-normal margin-top-bottom-normal text-size-biggest text-weight-bolder">
        {title}
      </h4>
    ) : null}
    {content ? (
      <div className="full-screen__description padding-normal margin-left-right-normal text-size-big text-line-height-base">
        {content}
      </div>
    ) : null}
  </div>
);
FullScreenStandardContent.displayName = 'FullScreenStandardContent';
FullScreenStandardContent.propTypes = {
  status: PropTypes.string,
  image: PropTypes.string,
  content: PropTypes.node,
  title: PropTypes.string,
};
FullScreenStandardContent.defaultProps = {
  status: FEEDBACK_STATUS.ERROR,
  image: null,
  content: null,
  title: null,
};
const normalizeButtons = buttons =>
  buttons.map((buttonOptions, index) => ({
    key: `full-screen-button-${index}`,
    type: BUTTONS_STYLE_TYPES.OUTLINE,
    content: null,
    onClick: () => {},
    ...buttonOptions,
  }));
const normalizeFullScreenOptions = ({ buttons, ...restOptions }) => ({
  container: document.body,
  show: true,
  closeButtonContent: null,
  className: '',
  style: {},
  onClose: () => {},
  buttons: buttons ? normalizeButtons(buttons) : [],
  ...restOptions,
});
const createFullScreen = (content, options) =>
  new Promise(resolve => {
    const { container, onClose, ...restOptions } = options;
    const rootDOM = document.createElement('div');

    rootDOM.setAttribute('class', 'feedback__container fixed-wrapper');
    container.appendChild(rootDOM);

    const fullScreenInstance = React.createElement(FullScreen, {
      content,
      ...restOptions,
      onClose: () => {
        render(React.cloneElement(fullScreenInstance, { show: false }), rootDOM, () => {
          destroyTarget(rootDOM);
          resolve();
          // FullScreen component will trigger onModalVisibilityChanged() when destroyTarget. If onClose function is not on async queue, redirection URL will be assignment
          setTimeout(() => onClose(), 0);
        });
      },
    });

    render(fullScreenInstance, rootDOM);
  });

export const fullScreen = (content, options = {}) => {
  const { title, buttons, ...restOptions } = options;

  createFullScreen(
    <FullScreenStandardContent status={restOptions.status} image={restOptions.image} title={title} content={content} />,
    normalizeFullScreenOptions(restOptions)
  );
};

fullScreen.raw = (content, options = {}) => createFullScreen(content, normalizeFullScreenOptions(options));
