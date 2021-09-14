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
// import Confirm from './Confirm';

// const normalizeConfirmOptions = options => ({
//   closeContent: null,
//   okContent: null,
//   className: '',
//   container: document.body,
//   style: {},
//   onClose: () => {},
//   onOk: () => {},
//   ...options,
// });
// const createConfirmFeedback = (content, options) => {
//   const { container, onClose, onOk, ...otherOptions } = options;
//   const rootDOM = document.createElement('div');

//   rootDOM.setAttribute('class', 'confirm-container');
//   (container || document.body).appendChild(rootDOM);

//   ReactDOM.render(
//     React.createElement(Confirm, {
//       content,
//       ...otherOptions,
//       onClose: async () => {
//         await onClose();
//         destroyFeedback(rootDOM);
//       },
//       onOk: async () => {
//         await onOk();
//         destroyFeedback(rootDOM);
//       },
//     }),
//     rootDOM
//   );
// };

// export function confirm(content, options = {}) {
//   createConfirmFeedback(normalizeContent(content), normalizeConfirmOptions(options));
// }

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
