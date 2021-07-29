import React from 'react';
import ReactDOM from 'react-dom';
import { IconClose } from '../../components/Icons';
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

function destroyFeedback(target) {}

const feedbackAlert = ({ content, options }) => {
  const { button, className, style } = options;
  const classList = [...className];

  return (
    <div className={classList.join(' ')} style={style}>
      {content}
      {button || <IconClose onClick={destroyFeedback()} />}
    </div>
  );
};

feedbackAlert.create.displayName = 'alert';

export function alert(content, options) {
  const alertPromise = new Promise();

  alertPromise.then(() => {
    return ReactDOM.render(React.createElement(feedbackAlert, _extends({}, props, {})), <div />);
  });
}
