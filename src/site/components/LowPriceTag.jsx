import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ShieldDollarIcon } from '../../common/components/Icons';
import styles from './LowPriceTag.module.scss';

const LowPriceTag = ({ className }) => {
  const { t } = useTranslation('SiteHome');
  const classNameList = [styles.LowPriceTagContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <li className={classNameList.join(' ')}>
      <ShieldDollarIcon className="tw-flex" />
      <span className={styles.LowPriceTagTitle}>{t('LowestPrice')}</span>
    </li>
  );
};

LowPriceTag.displayName = 'PromoTag';

LowPriceTag.propTypes = {
  className: PropTypes.string,
};

LowPriceTag.defaultProps = {
  className: '',
};

export default LowPriceTag;
