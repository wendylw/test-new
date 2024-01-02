import React from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../Loader';
import styles from './PageLoader.module.scss';

const PageLoadingIndicator = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.PageLoaderContainer}>
      <div className={styles.PageLoaderIndicatorWrapper}>
        <Loader size={30} color="white" />
        <span className="tw-text-white tw-p-8 sm:tw-p-8px">{t('Loading')}</span>
      </div>
    </div>
  );
};

PageLoadingIndicator.displayName = 'PageLoadingIndicator';

export default PageLoadingIndicator;
