import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsMerchantMembershipPointsEnabled } from '../../../../../../../redux/modules/merchant/selectors';
import UniquePromoList from '../../../../components/UniquePromoList';
import styles from './UniquePromoListSection.module.scss';

const UniquePromoListSection = () => {
  const { t } = useTranslation(['Rewards']);
  const isMerchantMembershipPointsEnabled = useSelector(getIsMerchantMembershipPointsEnabled);

  if (isMerchantMembershipPointsEnabled) {
    return null;
  }

  return (
    <section className={styles.UniquePromoListSection}>
      <h2 className={styles.UniquePromoListSectionTitle}>{t('MyRewards')}</h2>
      <UniquePromoList />
    </section>
  );
};

UniquePromoListSection.displayName = 'UniquePromoListSection';

export default UniquePromoListSection;
