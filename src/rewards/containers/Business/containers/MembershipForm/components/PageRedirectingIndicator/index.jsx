import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../../../../common/components/Loader';
import { getIsJoinMembershipRequestStatusPending } from '../../../../redux/common/selectors';
import styles from './PageRedirectingIndicator.module.scss';

const PageRedirectingIndicator = () => {
  const { t } = useTranslation();

  const isVisible = useSelector(getIsJoinMembershipRequestStatusPending);

  if (!isVisible) return null;

  return (
    <div className={styles.PageRedirectingContainer}>
      <div className={styles.PageRedirectingIndicatorWrapper}>
        <Loader size={30} color="white" />
        <span className="tw-text-white tw-p-8 sm:tw-p-8px">{t('Redirecting')}</span>
      </div>
    </div>
  );
};

PageRedirectingIndicator.displayName = 'PageRedirectingIndicator';

export default PageRedirectingIndicator;
