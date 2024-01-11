import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../../../../common/components/Loader';
import { getIsJoinMembershipRequestStatusPending } from '../../../../redux/common/selectors';
import styles from './JoiningIndicator.module.scss';

const JoiningIndicator = () => {
  const { t } = useTranslation('Rewards');

  const isVisible = useSelector(getIsJoinMembershipRequestStatusPending);

  if (!isVisible) return null;

  return (
    <div className={styles.JoiningIndicatorContainer}>
      <div className={styles.JoiningIndicatorWrapper}>
        <Loader size={30} color="white" />
        <span className="tw-text-white tw-p-8 sm:tw-p-8px">{t('Joining')}</span>
      </div>
    </div>
  );
};

JoiningIndicator.displayName = 'JoiningIndicator';

export default JoiningIndicator;
