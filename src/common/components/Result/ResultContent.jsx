import React from 'react';
import PropTypes from 'prop-types';
import ResultErrorImage from '../../../images/result-error.svg';
import styles from './ResultContent.module.scss';

const ResultContent = props => {
  const { content, imageSrc, title, style } = props;

  return (
    <div className={styles.resultBody} style={style}>
      <div className={styles.resultImage}>
        <img src={imageSrc || ResultErrorImage} alt="StoreHub full screen feedback" />
      </div>
      {title ? <h4 className={styles.resultTitle}>{title}</h4> : null}
      {content ? <div className={styles.resultDescription}>{content}</div> : null}
    </div>
  );
};

ResultContent.displayName = 'ResultContent';

ResultContent.propTypes = {
  content: PropTypes.node,
  imageSrc: PropTypes.string,
  title: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

ResultContent.defaultProps = {
  content: null,
  imageSrc: null,
  title: null,
  style: {},
};

export default ResultContent;
