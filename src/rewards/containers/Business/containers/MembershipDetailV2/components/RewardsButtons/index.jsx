import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WarningCircle } from 'phosphor-react';
import RewardsIcon from '../../../../../../../images/rewards-icon-rewards.svg';
import RewardsPointsIcon from '../../../../../../../images/rewards-icon-points.svg';
import RewardsCashbackIcon from '../../../../../../../images/rewards-icon-cashback.svg';
import RewardsStoreCreditsIcon from '../../../../../../../images/rewards-icon-store-credits.svg';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { getClient } from '../../../../../../../common/utils';
import { getClassName } from '../../../../../../../common/utils/ui';
import CleverTap from '../../../../../../../utils/clevertap';
import {
  getIsMerchantMembershipPointsEnabled,
  getIsMerchantEnabledCashback,
  getMerchantBusiness,
} from '../../../../../../../redux/modules/merchant/selectors';
import {
  getCustomerAvailablePointsBalance,
  getCustomerRewardsTotal,
} from '../../../../../../redux/modules/customer/selectors';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import { getCustomerCashbackPriceWithoutCurrency } from '../../../../redux/common/selectors';
import { getIsRewardsCashbackCreditsButtonShow, getIsExpiringIconShown } from '../../redux/selectors';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './RewardsButtons.module.scss';

const RewardsButtons = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isMerchantMembershipPointsEnabled = useSelector(getIsMerchantMembershipPointsEnabled);
  const availablePointsBalance = useSelector(getCustomerAvailablePointsBalance);
  const customerRewardsTotal = useSelector(getCustomerRewardsTotal);
  const isMerchantEnabledCashback = useSelector(getIsMerchantEnabledCashback);
  const isRewardsCashbackCreditsButtonShow = useSelector(getIsRewardsCashbackCreditsButtonShow);
  const customerCashbackPriceWithoutCurrency = useSelector(getCustomerCashbackPriceWithoutCurrency);
  const isExpiringIconShown = useSelector(getIsExpiringIconShown);
  const search = useSelector(getLocationSearch);
  const buttonContentClassName = getClassName([
    styles.RewardsButtonContent,
    isRewardsCashbackCreditsButtonShow ? 'tw-flex-col' : null,
  ]);
  const handlePointsDetailButtonClick = useCallback(() => {
    CleverTap.pushEvent('Membership Details Page - Click Points button', {
      'account name': merchantBusiness,
      source: getClient(),
    });

    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.POINTS_HISTORY}`,
      search,
    });
  }, [history, search, merchantBusiness]);
  const handleCashbackCreditsHistoryButtonClick = useCallback(() => {
    CleverTap.pushEvent(
      isMerchantEnabledCashback
        ? 'Membership Details Page - Click Cashback button'
        : 'Membership Details Page - Click Store Credit button',
      {
        'account name': merchantBusiness,
        source: getClient(),
      }
    );

    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.CASHBACK_CREDITS_HISTORY}`,
      search,
    });
  }, [history, search, merchantBusiness, isMerchantEnabledCashback]);
  const handleMyRewardsButtonClick = useCallback(() => {
    CleverTap.pushEvent('Membership Details Page - Click My Rewards button', {
      'account name': merchantBusiness,
      source: getClient(),
    });

    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search, merchantBusiness]);

  if (!isMerchantMembershipPointsEnabled) {
    return null;
  }

  return (
    <section className={styles.RewardsButtons}>
      <Button
        data-test-id="rewards.business.membershipDetail.rewards-buttons.pints-button"
        theme="ghost"
        type="text"
        className={styles.RewardsButton}
        contentClassName={buttonContentClassName}
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

      {isRewardsCashbackCreditsButtonShow ? (
        <Button
          data-test-id="rewards.business.membershipDetail.rewards-buttons.cashback-button"
          theme="ghost"
          type="text"
          className={styles.RewardsButton}
          contentClassName={buttonContentClassName}
          onClick={handleCashbackCreditsHistoryButtonClick}
        >
          <div className={styles.RewardsButtonCashbackIconContainer}>
            <ObjectFitImage
              noCompression
              src={isMerchantEnabledCashback ? RewardsCashbackIcon : RewardsStoreCreditsIcon}
            />
          </div>
          <div className={styles.RewardsButtonText}>
            <data className={styles.RewardsButtonCashback} value={customerCashbackPriceWithoutCurrency}>
              {customerCashbackPriceWithoutCurrency}
              {isExpiringIconShown && (
                <WarningCircle className={styles.RewardsButtonCashbackWarningIcon} size={18} weight="fill" />
              )}
            </data>
            <span className={styles.RewardsButtonCashbackText}>
              {isMerchantEnabledCashback ? t('Cashback') : t('StoreCredits')}
            </span>
          </div>
        </Button>
      ) : null}

      <Button
        data-test-id="rewards.business.membershipDetail.rewards-buttons.rewards-button"
        theme="ghost"
        type="text"
        className={styles.RewardsButton}
        contentClassName={buttonContentClassName}
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
