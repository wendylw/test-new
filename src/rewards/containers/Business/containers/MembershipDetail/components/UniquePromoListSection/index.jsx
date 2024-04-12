import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsMyRewardsSectionShow } from '../../redux/selectors';
import UniquePromoList from '../../../../components/UniquePromoList';
import styles from './UniquePromoListSection.module.scss';

const UniquePromoListSection = () => {
  const { t } = useTranslation(['Rewards']);
  const isMyRewardsSectionShow = useSelector(getIsMyRewardsSectionShow);

  if (isMyRewardsSectionShow) {
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
