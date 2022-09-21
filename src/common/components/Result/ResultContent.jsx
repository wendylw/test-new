import React from 'react';
import PropTypes from 'prop-types';
import ResultErrorImage from '../../../images/result-error.svg';
import styles from './ResultContent.module.scss';

const ResultContent = props => {
  const { content, imageSrc, title, style } = props;

  return (
    <div className={styles.resultBody} style={style}>
      <img src={imageSrc || ResultErrorImage} alt="StoreHub full screen feedback" />
      {title ? <h4 className="tw-flex tw-justify-center tw-text-xl tw-leading-normal tw-font-bold">{title}</h4> : null}
      {content ? (
        <div className="tw-flex tw-justify-center tw-mt-4 sm:tw-mt-4px tw-mb-8 sm:tw-mb-8px tw-leading-relaxed tw-text-gray-700">
          {content}
        </div>
      ) : null}
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
