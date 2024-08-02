import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import RewardsJoinMembershipImage from '../../../../../../../images/rewards-join-membership.svg';
import {
  getJoinMembershipRewardList,
  getIsOrderRewardsDescriptionShow,
  getOrderRewardsPoints,
  getOrderRewardsCashback,
  getOrderRewardsCashbackPrice,
} from '../../redux/selectors';
import { RewardsPoint, RewardsCashback, DirectionArrow } from '../../../../../../../common/components/Icons';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import Ticket from '../../../../components/Ticket';
import styles from './RewardsDescription.module.scss';

const RewardsDescription = () => {
  const { t } = useTranslation(['Rewards']);
  const joinMembershipRewardList = useSelector(getJoinMembershipRewardList);
  const isOrderRewardsDescriptionShow = useSelector(getIsOrderRewardsDescriptionShow);
  const orderRewardsPoints = useSelector(getOrderRewardsPoints);
  const orderRewardsCashback = useSelector(getOrderRewardsCashback);
  const orderRewardsCashbackPrice = useSelector(getOrderRewardsCashbackPrice);

  return (
    <div className={styles.RewardsDescription}>
      {isOrderRewardsDescriptionShow ? (
        <div className={styles.RewardsDescriptionGetRewardsContainer}>
          <h3 className={styles.RewardsDescriptionGetRewardsTitle}>{t('JoinMembershipGetRewardsTitle')}</h3>
          <ul className={styles.RewardsDescriptionTicketList}>
            {orderRewardsPoints ? (
              <li className={styles.RewardsDescriptionTicketItem}>
                <Ticket
                  className={styles.RewardsDescriptionTicketContainer}
                  ticketClassName={`${styles.RewardsDescriptionPointsTicket} ${styles.RewardsDescriptionTicket}`}
                  stubClassName={styles.RewardsDescriptionTicketStub}
                  main={<RewardsPoint />}
                  stub={
                    <>
                      <data className={styles.RewardsDescriptionTicketValue} value={orderRewardsPoints}>
                        {orderRewardsPoints}
                      </data>
                      <span className={styles.RewardsDescriptionTicketText}>{t('Points')}</span>
                    </>
                  }
                />
              </li>
            ) : null}
            {orderRewardsCashback ? (
              <li className={styles.RewardsDescriptionTicketItem}>
                <Ticket
                  className={styles.RewardsDescriptionTicketContainer}
                  ticketClassName={`${styles.RewardsDescriptionCashbackTicket} ${styles.RewardsDescriptionTicket}`}
                  stubClassName={styles.RewardsDescriptionTicketStub}
                  main={<RewardsCashback color="#1c1c1c" />}
                  stub={
                    <>
                      <data className={styles.RewardsDescriptionTicketValue} value={orderRewardsCashbackPrice}>
                        {orderRewardsCashbackPrice}
                      </data>
                      <span className={styles.RewardsDescriptionTicketText}>{t('Cashback')}</span>
                    </>
                  }
                />
              </li>
            ) : null}
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
