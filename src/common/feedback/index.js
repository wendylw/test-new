import React from 'react';
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
const FeedbackOptions = {
  onClose: () => {},
  icon: null,
};

export const alert = {
  create: (content, options) => {
    const { closeIcon, className, style } = options;
    const classList = [...className];

    return (
      <div className={classList.join(' ')} style={style}>
        {content}
        {closeIcon || <IconClose />}
      </div>
    );
  },
  mounted: () => {},
};

alert.create.displayName = 'alert';
