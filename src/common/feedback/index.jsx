import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { IconClose } from '../../components/Icons';
import './Feedback.scss';
// declare type FEEDBACK_TYPES = 'alert' | 'confirm' | 'toast' | 'fullScreen';
// declare type FeedbackContent = React.ReactNode | string;
// declare type FeedbackOptions = {
//   duration?: number | null;
//   type: FEEDBACK_TYPES;
//   onClose?: () => void;
//   icon?: React.ReactNode;
//   key?: string | number;
// };
// export interface FeedbackInstance {
//   alert(content: FeedbackContent, options?: FeedbackOptions);
// }
const normalizeContent = content => content || null;
const normalizeAlertOptions = options => ({
  buttonContent: null,
  className: '',
  style: {},
  ...options,
});
const destroyFeedback = target => {
  ReactDOM.unmountComponentAtNode(target);

  target.remove();
};

const FeedbackAlert = props => {
  const { content, buttonContent, className, style, close } = props;

  return (
    <div className={`${className ? ` ${className}` : ''}`} style={style}>
      {content}
      <button onClick={() => close()}>{buttonContent || <IconClose />}</button>
    </div>
  );
};

FeedbackAlert.displayName = 'FeedbackAlert';

export function alert(content, options) {
  const { container, onClose, ...otherOptions } = options;
  const feedbackRootDOM = document.createElement('div');
  feedbackRootDOM.setAttribute('class', 'feedback');

  (container || document.body).appendChild(feedbackRootDOM);

  ReactDOM.render(
    React.createElement(FeedbackAlert, {
      content: normalizeContent(content),
      ...normalizeAlertOptions(otherOptions),
      close: () => {
        onClose();
        destroyFeedback(feedbackRootDOM);
      },
    }),
    feedbackRootDOM
  );
}

// async function a() {
//   var result = await alertPromise(<span></span>, { button: 'xxxx' });
//   if (result === true) {
//     document.location = 'xxxx';
//   }
//   console.log(result);
// }

// function b() {
//   alert('xxx', { onClose: () => {} });
// }

// const alertPromise = (content, option) => {
//   return new Promise(resolve => {
//     alert(content, {
//       ...option,
//       onClose: () => {
//         resolve();
//       },
//     });
//   });
// };
