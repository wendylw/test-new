import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import RewardsJoinMembershipImage from '../../../../../../../images/rewards-join-membership.svg';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import { getJoinMembershipRewardList } from '../../redux/selectors';
import styles from './RewardsDescription.module.scss';

const RewardsDescription = () => {
  const { t } = useTranslation(['Rewards']);
  const joinMembershipRewardList = useSelector(getJoinMembershipRewardList);

  return (
    <div className={styles.RewardsDescription}>
      <div className={styles.RewardsDescriptionImageContainer}>
        <ObjectFitImage noCompression src={RewardsJoinMembershipImage} />
      </div>
      <p className={styles.RewardsDescriptionPrompt}>{t('JoinMembershipRewardsPrompt')}</p>
      <ol className={styles.RewardsDescriptionIconList}>
        {joinMembershipRewardList.map(({ key, icon, text }) => (
          <li key={`join-membership-rewards-${key}`} className={styles.RewardsDescriptionIconItem}>
            <div className={styles.RewardsDescriptionIconContainer}>
              <ObjectFitImage noCompression src={icon} />
            </div>
            <span className={styles.RewardsDescriptionItemText}>{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

RewardsDescription.displayName = 'RewardsDescription';

export default RewardsDescription;
