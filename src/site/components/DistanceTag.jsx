import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'phosphor-react';
import styles from './DistanceTag.module.scss';

const DistanceTag = ({ distance, className }) => {
  const { t } = useTranslation();
  const classNameList = [styles.DistanceTag__container, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <li className={classNameList.join(' ')}>
      <MapPin className={styles.DistanceTag__icon} weight="light" size={16} />
      <span className="sm:tw-mx-4px tw-mx-4 sm:tw-my-2px tw-my-2 tw-text-sm tw-leading-normal">
        {t('DistanceText', { distance: `~ ${(distance || 0).toFixed(2)}` })}
      </span>
    </li>
  );
};

DistanceTag.displayName = 'DistanceTag';

DistanceTag.propTypes = {
  distance: PropTypes.number,
  className: PropTypes.string,
};

DistanceTag.defaultProps = {
  distance: 0,
  className: '',
};

export default DistanceTag;
