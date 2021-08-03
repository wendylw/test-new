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
// const FeedbackOptions = {
//   onClose: () => {},
//   icon: null,
// };
// const FeedbackDOM = async () => {
//   const feedbackRootDOM = document.createElement('div');
//   feedbackRootDOM.setAttribute('id', 'common-feedback');
//   feedbackRootDOM.setAttribute('class', 'feedback');

//   await document.body.appendChild(feedbackRootDOM);

//   return feedbackRootDOM;
// };
const FeedbackContent = content => content || null;
const FeedbackAlertOptions = options => ({
  buttonContent: null,
  className: '',
  style: {},
  ...options,
});
const destroyFeedback = target => {
  ReactDOM.unmountComponentAtNode(target);

  target.remove();
};

const FeedbackAlert = ({ content, options, onClose }) => {
  const feedbackAlertEl = useRef(null);
  const { buttonContent, className, style } = FeedbackAlertOptions(options);
  const classList = [...className];

  return (
    <div ref={feedbackAlertEl} className={classList.join(' ')} style={style}>
      {FeedbackContent(content)}
      <button onClick={() => onClose()}>{buttonContent || <IconClose />}</button>
    </div>
  );
};

FeedbackAlert.displayName = 'FeedbackAlert';

export function alert(content, options, container) {
  const feedbackRootDOM = document.createElement('div');
  feedbackRootDOM.setAttribute('id', 'common-feedback');
  feedbackRootDOM.setAttribute('class', 'feedback');

  (container || document.body).appendChild(feedbackRootDOM);

  ReactDOM.render(
    React.createElement(FeedbackAlert, {
      content,
      options,
      onClose: () => destroyFeedback(feedbackRootDOM),
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
