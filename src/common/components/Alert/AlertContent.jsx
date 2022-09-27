import React from 'react';
import PropTypes from 'prop-types';
import styles from './AlertContent.module.scss';

const AlertContent = props => {
  const { content, title, style } = props;

  return (
    <div className={styles.alertBody} style={style}>
      {title ? <h4 className={styles.alertTitle}>{title}</h4> : null}
      {content ? <div className={styles.alertDescription}>{content}</div> : null}
    </div>
  );
};

AlertContent.displayName = 'AlertContent';

AlertContent.propTypes = {
  content: PropTypes.node,
  title: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

AlertContent.defaultProps = {
  content: null,
  title: null,
  style: {},
};

export default AlertContent;
