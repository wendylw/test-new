import React from 'react';
import PropTypes from 'prop-types';
import styles from './ConfirmContent.module.scss';

const ConfirmContent = props => {
  const { content, title, style } = props;

  return (
    <div className={styles.confirmBody} style={style}>
      {title ? <h4 className="tw-flex tw-justify-center tw-text-xl tw-leading-normal tw-font-bold">{title}</h4> : null}
      {content ? (
        <div className="tw-flex tw-justify-center tw-text-center tw-mt-4 sm:tw-mt-4px tw-mb-8 sm:tw-mb-8px tw-leading-relaxed tw-text-gray-700">
          {content}
        </div>
      ) : null}
    </div>
  );
};

ConfirmContent.displayName = 'ConfirmContent';

ConfirmContent.propTypes = {
  content: PropTypes.node,
  title: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

ConfirmContent.defaultProps = {
  content: null,
  title: null,
  style: {},
};

export default ConfirmContent;
