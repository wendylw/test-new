import React from 'react';
import PropTypes from 'prop-types';
import Result from '../../../common/components/Result';
import styles from './ContentResult.module.scss';

const ContentResult = ({ show, icon, title, description }) => (
  <Result className={styles.ContentResult} show={show} isCloseButtonShow={false}>
    <i className={styles.ContentResultIcon}>{icon}</i>
    <h3 className={styles.ContentResultTitle}>{title}</h3>
    <p className={styles.ContentResultDescription}>{description}</p>
  </Result>
);

ContentResult.displayName = 'ContentResult';

ContentResult.propTypes = {
  show: PropTypes.bool,
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
};

ContentResult.defaultProps = {
  show: false,
  icon: null,
  title: '',
  description: '',
};

ContentResult.displayName = 'ContentResult';

export default ContentResult;
