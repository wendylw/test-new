import React from 'react';
import IconChecked from '../../components/Icons';
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
const FeedbackOptions = {
  onClose: () => {},
  icon: null,
};

export const alert = {
  create: (content, options) => {
    const { icon, onClose } = options;

    return (
      <div>
        <IconChecked />
        {content}
      </div>
    );
  },
};
