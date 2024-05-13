import React from 'react';
import { useTranslation } from 'react-i18next';
import RewardsJoinMembershipImage from '../../../../../../../images/rewards-join-membership.svg';
// import RewardsPointsWhiteIcon from '../../../../../../../images/rewards-points-icon-white.svg';
import RewardsCashbackWhiteIcon from '../../../../../../../images/rewards-cashback-icon-white.svg';
// import RewardsStoreCreditsWhiteIcon from '../../../../../../../images/rewards-store-credits-icon-white.svg';
import RewardsDiscountWhiteIcon from '../../../../../../../images/rewards-discount-icon-white.svg';
import RewardsVouchersWhiteIcon from '../../../../../../../images/rewards-vouchers-icon-white.svg';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import { getIsMerchantEnabledCashback } from '../../../../../../../redux/modules/merchant/selectors';
import styles from './RewardsDescription.module.scss';
import { useSelector } from 'react-redux';

const RewardsDescription = () => {
  const { t } = useTranslation(['Rewards']);
  const isMerchantEnabledCashback = useSelector(getIsMerchantEnabledCashback);

  return (
    <div className={styles.RewardsDescription}>
      <div className={styles.RewardsDescriptionImageContainer}>
        <ObjectFitImage noCompression src={RewardsJoinMembershipImage} />
      </div>
      <p className={styles.RewardsDescriptionPrompt}>{t('JoinMembershipRewardsPrompt')}</p>
      <ol className={styles.RewardsDescriptionIconList}>
        {/* <li className={styles.RewardsDescriptionIconItem}>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsPointsWhiteIcon} />
          </div>
          <span></span>
        </li> */}
        {isMerchantEnabledCashback && (
          <li className={styles.RewardsDescriptionIconItem}>
            <div className={styles.RewardsDescriptionIconContainer}>
              <ObjectFitImage noCompression src={RewardsCashbackWhiteIcon} />
            </div>
            <span className={styles.RewardsDescriptionItemText}>{t('Cashback')}</span>
          </li>
        )}
        {/* <li className={styles.RewardsDescriptionIconItem}>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsStoreCreditsWhiteIcon} />
          </div>
        </li> */}
        <li className={styles.RewardsDescriptionIconItem}>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsDiscountWhiteIcon} />
          </div>
          <span className={styles.RewardsDescriptionItemText}>{t('Discounts')}</span>
        </li>
        <li className={styles.RewardsDescriptionIconItem}>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsVouchersWhiteIcon} />
          </div>
          <span className={styles.RewardsDescriptionItemText}>{t('Vouchers')}</span>
        </li>
      </ol>
    </div>
  );
};

RewardsDescription.displayName = 'RewardsDescription';

export default RewardsDescription;
