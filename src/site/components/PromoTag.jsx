import React from 'react';
import PropTypes from 'prop-types';
import styles from './PromoTag.module.scss';

const PromoTag = ({ tagName, className }) => {
  const classNameList = [styles.PromoTagContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <li className={classNameList.join(' ')}>
      <span className="tw-block tw-text-xs tw-leading-loose tw-truncate">{tagName}</span>
    </li>
  );
};

PromoTag.displayName = 'PromoTag';

PromoTag.propTypes = {
  tagName: PropTypes.string,
  className: PropTypes.string,
};

PromoTag.defaultProps = {
  tagName: '',
  className: '',
};

export default PromoTag;
