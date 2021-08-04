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
import React from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';

const normalizeContent = content => content || null;
const normalizeAlertOptions = options => ({
  buttonContent: null,
  className: '',
  style: {},
  ...options,
});
const createFeedback = (content, options) => {
  const { container, element, onClose, normalizeOptions, ...otherOptions } = options;
  const rootDOM = document.createElement('div');
  rootDOM.setAttribute('class', 'feedback');

  (container || document.body).appendChild(rootDOM);

  ReactDOM.render(
    React.createElement(element, {
      content: normalizeContent(content),
      ...normalizeOptions(otherOptions),
      close: () => {
        onClose();
        destroyFeedback(rootDOM);
      },
    }),
    rootDOM
  );
};
const destroyFeedback = target => {
  ReactDOM.unmountComponentAtNode(target);

  target.remove();
};

export function alert(content, options) {
  createFeedback(content, {
    ...options,
    element: Alert,
    normalizeOptions: normalizeAlertOptions,
  });
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
