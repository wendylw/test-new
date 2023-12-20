import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../../../../common/components/Loader';
import { getIsGoogleReviewRedirectIndicatorVisible } from '../../redux/selectors';
import styles from './GoogleReviewRedirectIndicator.module.scss';

const GoogleReviewRedirectIndicator = () => {
  const { t } = useTranslation('OrderingThankYou');

  const isVisible = useSelector(getIsGoogleReviewRedirectIndicatorVisible);

  if (!isVisible) return null;

  return (
    <div className={styles.GoogleReviewRedirectIndicatorContainer}>
      <div className={styles.GoogleReviewRedirectIndicatorWrapper}>
        <Loader size={30} color="white" />
        <span className="tw-text-white tw-px-12 sm:tw-px-12px tw-py-8 sm:tw-py-8px tw-text-center tw-leading-relaxed">
          {t('RedirectingToGoogleReview')}
        </span>
      </div>
    </div>
  );
};

GoogleReviewRedirectIndicator.displayName = 'GoogleReviewRedirectIndicator';

export default GoogleReviewRedirectIndicator;
