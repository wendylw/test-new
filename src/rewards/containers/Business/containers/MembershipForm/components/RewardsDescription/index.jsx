import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import RewardsJoinMembershipImage from '../../../../../../../images/rewards-join-membership.svg';
import { getJoinMembershipRewardList, getIsOrderRewardsDescriptionShow } from '../../redux/selectors';
import { RewardsPoint, RewardsCashback, DirectionArrow } from '../../../../../../../common/components/Icons';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import Ticket from '../../../../components/Ticket';
import styles from './RewardsDescription.module.scss';

const RewardsDescription = () => {
  const { t } = useTranslation(['Rewards']);
  const joinMembershipRewardList = useSelector(getJoinMembershipRewardList);
  const isOrderRewardsDescriptionShow = useSelector(getIsOrderRewardsDescriptionShow);

  return (
    <div className={styles.RewardsDescription}>
      {isOrderRewardsDescriptionShow ? (
        <>
          <h3 className={styles.RewardsDescriptionGetRewardsTitle}>{t('JoinMembershipGetRewardsTitle')}</h3>
          <ul>
            <li>
              <Ticket
                main={<RewardsPoint />}
                stub={
                  <>
                    <data value="points">points</data>
                    <span>{t('Points')}</span>
                  </>
                }
              />
            </li>
            <li>
              <Ticket
                main={<RewardsCashback />}
                stub={
                  <>
                    <data value="points">cashback price</data>
                    <span>{t('Cashback')}</span>
                  </>
                }
              />
            </li>
          </ul>
          <p className={styles.RewardsDescriptionGetRewardsDescription}>{t('JoinMembershipGetRewardsDescription')}</p>
          <DirectionArrow />
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

RewardsDescription.displayName = 'RewardsDescription';

export default RewardsDescription;
