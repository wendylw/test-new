import React from 'react';
import { useTranslation } from 'react-i18next';
import RewardsEmptyListImage from '../../../../../../../images/rewards-empty-list-icon.svg';
import ResultContent from '../../../../../../../common/components/Result/ResultContent';
import styles from './EmptyVoucher.module.scss';

const EmptyVoucher = () => {
  const { t } = useTranslation(['OrderingPromotion']);

  return (
    <section className={styles.EmptyVoucher}>
      <ResultContent imageSrc={RewardsEmptyListImage} content={t('CustomerNoRewardResultDescription')} />
    </section>
  );
};

EmptyVoucher.displayName = 'EmptyVoucher';

export default EmptyVoucher;
