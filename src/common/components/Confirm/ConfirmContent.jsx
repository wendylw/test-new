import React from 'react';
import PropTypes from 'prop-types';
import styles from './ConfirmContent.module.scss';

const ConfirmContent = props => {
  const { content, title, style } = props;

  return (
    <div className={styles.confirmBody} style={style}>
      {title ? <h4 className={styles.confirmTitle}>{title}</h4> : null}
      {content ? <div className={styles.confirmDescription}>{content}</div> : null}
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
