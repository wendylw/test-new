import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import RewardsJoinMembershipImage from '../../../../../../../images/rewards-join-membership.svg';
import { REWARDS_NAMES } from '../../constants';
import { getJoinMembershipRewardList, getIsOrderRewardsDescriptionShow, getOrderRewards } from '../../redux/selectors';
import { RewardsPoint, RewardsCashback, DirectionArrow } from '../../../../../../../common/components/Icons';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import Ticket from '../../../../components/Ticket';
import styles from './RewardsDescription.module.scss';

const REWARDS_UI_SETTINGS = {
  [REWARDS_NAMES.POINTS]: {
    styles: styles.RewardsDescriptionPointsTicket,
    icon: <RewardsPoint />,
    textKey: 'Points',
  },
  [REWARDS_NAMES.CASHBACK]: {
    styles: styles.RewardsDescriptionCashbackTicket,
    icon: <RewardsCashback color="#1c1c1c" />,
    textKey: 'Cashback',
  },
};

const RewardsDescription = () => {
  const { t } = useTranslation(['Rewards']);
  const joinMembershipRewardList = useSelector(getJoinMembershipRewardList);
  const isOrderRewardsDescriptionShow = useSelector(getIsOrderRewardsDescriptionShow);
  const orderRewards = useSelector(getOrderRewards);

  return (
    <div className={styles.RewardsDescription}>
      {isOrderRewardsDescriptionShow ? (
        <div className={styles.RewardsDescriptionGetRewardsContainer}>
          <h3 className={styles.RewardsDescriptionGetRewardsTitle}>{t('JoinMembershipGetRewardsTitle')}</h3>
          <ul className={styles.RewardsDescriptionTicketList}>
            {orderRewards.map(reward => {
              return (
                <li className={styles.RewardsDescriptionTicketItem}>
                  <Ticket
                    className={styles.RewardsDescriptionTicketContainer}
                    ticketClassName={`${REWARDS_UI_SETTINGS[reward.key].styles} ${styles.RewardsDescriptionTicket}`}
                    stubClassName={styles.RewardsDescriptionTicketStub}
                    main={REWARDS_UI_SETTINGS[reward.key].icon}
                    stub={
                      <>
                        <data className={styles.RewardsDescriptionTicketValue} value={reward.value}>
                          {reward.value}
                        </data>
                        <span className={styles.RewardsDescriptionTicketText}>
                          {t(REWARDS_UI_SETTINGS[reward.key].textKey)}
                        </span>
                      </>
                    }
                  />
                </li>
              );
            })}
          </ul>
          <p className={styles.RewardsDescriptionGetRewardsDescription}>{t('JoinMembershipGetRewardsDescription')}</p>
          <DirectionArrow className={styles.RewardsDescriptionGetRewardsDirectionArrow} />
        </div>
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
