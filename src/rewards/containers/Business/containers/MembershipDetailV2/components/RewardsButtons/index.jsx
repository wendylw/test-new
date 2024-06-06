import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RewardsIcon from '../../../../../../../images/rewards-icon-rewards.svg';
import RewardsPointsIcon from '../../../../../../../images/rewards-icon-points.svg';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { getIsMerchantMembershipPointsEnabled } from '../../../../../../../redux/modules/merchant/selectors';
import {
  getCustomerAvailablePointsBalance,
  getCustomerRewardsTotal,
} from '../../../../../../redux/modules/customer/selectors';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './RewardsButtons.module.scss';

const RewardsButtons = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const isMerchantMembershipPointsEnabled = useSelector(getIsMerchantMembershipPointsEnabled);
  const availablePointsBalance = useSelector(getCustomerAvailablePointsBalance);
  const customerRewardsTotal = useSelector(getCustomerRewardsTotal);
  const search = useSelector(getLocationSearch);
  const handlePointsDetailButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.POINTS_HISTORY}`,
      search,
    });
  }, [history, search]);
  const handleMyRewardsButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search]);

  if (!isMerchantMembershipPointsEnabled) {
    return null;
  }

  return (
    <section className={styles.RewardsButtons}>
      <Button
        data-test-id="rewards.business.rewards-button.pints-button"
        theme="ghost"
        type="text"
        className={styles.RewardsButton}
        contentClassName={styles.RewardsButtonContent}
        onClick={handlePointsDetailButtonClick}
      >
        <div className={styles.RewardsButtonPointsIconContainer}>
          <ObjectFitImage noCompression src={RewardsPointsIcon} />
        </div>
        <div className={styles.RewardsButtonText}>
          <data className={styles.RewardsButtonPoints} value={availablePointsBalance}>
            {availablePointsBalance}
          </data>
          <span className={styles.RewardsButtonPointsText}>{t('Points')}</span>
        </div>
      </Button>

      <Button
        data-test-id="rewards.business.rewards-button.rewards-button"
        theme="ghost"
        type="text"
        className={styles.RewardsButton}
        contentClassName={styles.RewardsButtonContent}
        onClick={handleMyRewardsButtonClick}
      >
        <div className={styles.RewardsButtonRewardsIconContainer}>
          <ObjectFitImage noCompression src={RewardsIcon} />
        </div>
        <div className={styles.RewardsButtonText}>
          <data className={styles.RewardsButtonMyRewards} value={customerRewardsTotal}>
            {customerRewardsTotal}
          </data>
          <span className={styles.RewardsButtonRewardsText}>{t('Rewards')}</span>
        </div>
      </Button>
    </section>
  );
};

RewardsButtons.displayName = 'RewardsButtons';

export default RewardsButtons;
