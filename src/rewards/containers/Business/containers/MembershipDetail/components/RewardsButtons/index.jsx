import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import RewardsIcon from '../../../../../../../images/rewards-icon.svg';
import RewardsCashbackIcon from '../../../../../../../images/rewards-earned-cashback.svg';
import RewardsStoreCreditsIcon from '../../../../../../../images/rewards-store-credits-icon.svg';
import RewardsPointsIcon from '../../../../../../../images/rewards-points-icon.svg';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import {
  getIsMerchantMembershipPointsEnabled,
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledStoreCredits,
} from '../../../../../../../redux/modules/merchant/selectors';
import {
  getCustomerAvailablePointsBalance,
  getCustomerCashback,
} from '../../../../../../redux/modules/customer/selectors';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './RewardsButtons.module.scss';

const RewardsButtons = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const isMerchantMembershipPointsEnabled = useSelector(getIsMerchantMembershipPointsEnabled);
  const isMerchantEnabledCashback = useSelector(getIsMerchantEnabledCashback);
  const isMerchantEnabledStoreCredits = useSelector(getIsMerchantEnabledStoreCredits);
  const availablePointsBalance = useSelector(getCustomerAvailablePointsBalance);
  const customerCashback = useSelector(getCustomerCashback);
  const search = useSelector(getLocationSearch);
  let cashbackCreditsButton = null;
  const handlePointsDetailButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.POINTS_HISTORY}`,
      search,
    });
  }, [history, search]);
  const handleCashbackCreditsHistoryButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.CASHBACK_CREDITS_HISTORY}`,
      search,
    });
  }, [history, search]);
  const handleMyRewardsButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search]);

  // set cashback credits button
  if (isMerchantEnabledCashback) {
    cashbackCreditsButton = (
      <Button
        data-test-id="rewards.business.rewards-button.cashback-button"
        theme="ghost"
        type="text"
        className={styles.RewardsButton}
        contentClassName={styles.RewardsButtonContent}
        onClick={handleCashbackCreditsHistoryButtonClick}
      >
        <div className={styles.RewardsButtonCashbackIconContainer}>
          <ObjectFitImage noCompression src={RewardsCashbackIcon} />
        </div>
        <div className={styles.RewardsButtonTitle}>
          <span className={styles.RewardsButtonCashbackText}>{t('Cashback')}</span>
          <CaretRight size={12} />
        </div>
        <data className={styles.RewardsButtonCashback} value={customerCashback}>
          {customerCashback}
        </data>
      </Button>
    );
  } else if (isMerchantEnabledStoreCredits) {
    cashbackCreditsButton = (
      <Button
        data-test-id="rewards.business.rewards-button.store-credits-button"
        theme="ghost"
        type="text"
        className={styles.RewardsButton}
        contentClassName={styles.RewardsButtonContent}
        onClick={handleCashbackCreditsHistoryButtonClick}
      >
        <div className={styles.RewardsButtonStoreCreditsIconContainer}>
          <ObjectFitImage noCompression src={RewardsStoreCreditsIcon} />
        </div>
        <div className={styles.RewardsButtonTitle}>
          <span className={styles.RewardsButtonStoreCreditsText}>{t('Cashback')}</span>
          <CaretRight size={12} />
        </div>
        <data className={styles.RewardsButtonStoreCredits} value={customerCashback}>
          {customerCashback}
        </data>
      </Button>
    );
  }
  // end of set cashback credits button

  return (
    <section className={styles.RewardsButtons}>
      {isMerchantMembershipPointsEnabled ? (
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
          <div className={styles.RewardsButtonTitle}>
            <span className={styles.RewardsButtonPointsText}>{t('Points')}</span>
            <CaretRight size={12} />
          </div>
          <data className={styles.RewardsButtonPoints} value={availablePointsBalance}>
            {availablePointsBalance}
          </data>
        </Button>
      ) : null}

      {cashbackCreditsButton}

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
        <div className={styles.RewardsButtonTitle}>
          <span className={styles.RewardsButtonRewardsText}>{t('MyRewards')}</span>
          <CaretRight size={12} />
        </div>
      </Button>
    </section>
  );
};

RewardsButtons.displayName = 'RewardsButtons';

export default RewardsButtons;
