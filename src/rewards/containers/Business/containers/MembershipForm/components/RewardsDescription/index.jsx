import React from 'react';
import { useTranslation } from 'react-i18next';
import RewardsJoinMembershipImage from '../../../../../../../images/rewards-join-membership.svg';
import RewardsPointsWhiteIcon from '../../../../../../../images/rewards-points-icon-white.svg';
import RewardsCashbackWhiteIcon from '../../../../../../../images/rewards-cashback-icon-white.svg';
import RewardsStoreCreditsWhiteIcon from '../../../../../../../images/rewards-store-credits-icon-white.svg';
import RewardsDiscountWhiteIcon from '../../../../../../../images/rewards-discount-icon-white.svg';
import RewardsVouchersWhiteIcon from '../../../../../../../images/rewards-vouchers-icon-white.svg';
import { ObjectFitImage } from '../../../../../../../common/components/Image';

const RewardsDescription = () => {
  const { t } = useTranslation(['Rewards']);

  return (
    <div>
      <div className={styles.RewardsDescriptionImageContainer}>
        <ObjectFitImage noCompression src={RewardsJoinMembershipImage} />
      </div>
      <p>{t('JoinMembershipRewardsPrompt')}</p>
      <ol>
        {/* <li>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsPointsWhiteIcon} />
          </div>
          <span></span>
        </li> */}
        <li>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsCashbackWhiteIcon} />
          </div>
          <span>{t('Cashback')}</span>
        </li>
        {/* <li>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsStoreCreditsWhiteIcon} />
          </div>
        </li> */}
        <li>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsDiscountWhiteIcon} />
          </div>
          <span>{t('Discounts')}</span>
        </li>
        <li>
          <div className={styles.RewardsDescriptionIconContainer}>
            <ObjectFitImage noCompression src={RewardsVouchersWhiteIcon} />
          </div>
          <span>{t('Vouchers')}</span>
        </li>
      </ol>
    </div>
  );
};

RewardsDescription.displayName = 'RewardsDescription';

export default RewardsDescription;
