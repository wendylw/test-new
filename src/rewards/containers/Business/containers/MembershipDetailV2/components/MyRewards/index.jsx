import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsMyRewardsSectionShow } from '../../redux/selectors';
import styles from './MyRewards.module.scss';

const MyRewards = () => {
  const { t } = useTranslation(['Rewards']);
  const isMyRewardsSectionShow = useSelector(getIsMyRewardsSectionShow);

  if (!isMyRewardsSectionShow) {
    return null;
  }

  return (
    <section className={styles.MyRewardsSection}>
      <h2 className={styles.MyRewardsSectionTitle}>{t('MyRewards')}</h2>
    </section>
  );
};

MyRewards.displayName = 'MyRewards';

export default MyRewards;
