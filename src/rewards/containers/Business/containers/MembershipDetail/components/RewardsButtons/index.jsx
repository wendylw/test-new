import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import RewardsIcon from '../../../../../../../images/rewards-icon.svg';
import RewardsPointsIcon from '../../../../../../../images/rewards-points-icon.svg';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { getIsMerchantMembershipPointsEnabled } from '../../../../../../../redux/modules/merchant/selectors';
import { getCustomerAvailablePointsBalance } from '../../../../../../redux/modules/customer/selectors';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import { actions as membershipDetailActions } from '../../redux';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './RewardsButtons.module.scss';

const RewardsButtons = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const dispatch = useDispatch();
  const isMerchantMembershipPointsEnabled = useSelector(getIsMerchantMembershipPointsEnabled);
  const availablePointsBalance = useSelector(getCustomerAvailablePointsBalance);
  const search = useSelector(getLocationSearch);
  const handlePointsDetailButtonClick = useCallback(() => {
    dispatch(membershipDetailActions.earnedPointsPromptDrawerShown());
  }, [dispatch]);
  const handleMyRewardsButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history]);

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
        <div className={styles.RewardsButtonTitle}>
          <span className={styles.RewardsButtonPointsText}>{t('Points')}</span>
          <CaretRight size={12} />
        </div>
        <data className={styles.RewardsButtonPoints} value={availablePointsBalance}>
          {availablePointsBalance}
        </data>
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
