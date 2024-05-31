import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { getUniquePromoListLength, getTopTwoUniquePromos } from '../../../../redux/common/selectors';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import { getIsMyRewardsSectionShow } from '../../redux/selectors';
import Button from '../../../../../../../common/components/Button';
import Ticket from '../../../../components/Ticket';
import styles from './MyRewards.module.scss';

const MyRewards = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const topTwoUniquePromos = useSelector(getTopTwoUniquePromos);
  const uniquePromoListLength = useSelector(getUniquePromoListLength);
  const isMyRewardsSectionShow = useSelector(getIsMyRewardsSectionShow);
  const search = useSelector(getLocationSearch);
  const handleClickViewAllButton = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search]);

  if (!isMyRewardsSectionShow) {
    return null;
  }

  return (
    <section className={styles.MyRewardsSection}>
      <div className={styles.MyRewardsSectionTopContainer}>
        <h2 className={styles.MyRewardsSectionTitle}>{t('MyRewards')}</h2>
        <Button
          type="text"
          size="small"
          theme="info"
          className={styles.MyRewardsSectionViewAllButton}
          contentClassName={styles.MyRewardsSectionViewAllButtonContent}
          data-test-id="rewards.membership-detail.my-rewards.view-all-button"
          onClick={handleClickViewAllButton}
        >
          {t('ViewAll')} ({uniquePromoListLength})
        </Button>
      </div>

      {topTwoUniquePromos.map(promo => (
        <Ticket
          key={promo.id}
          rightContentClassName={styles.MyRewardsTicketRightContent}
          leftContent={<h3 className={styles.MyRewardsTicketLeftContent}>{promo.name}</h3>}
        />
      ))}
    </section>
  );
};

MyRewards.displayName = 'MyRewards';

export default MyRewards;
