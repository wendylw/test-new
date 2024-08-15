import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { REWARDS_NAMES } from '../../constants';
import { getOrderRewards } from '../../redux/selectors';
import { RewardsPoint, RewardsCashback, DirectionArrow } from '../../../../../../../common/components/Icons';
import Ticket from '../../../../components/Ticket';
import styles from './OrderRewardsDescription.module.scss';

const REWARDS_UI_SETTINGS = {
  [REWARDS_NAMES.POINTS]: {
    styles: styles.OrderRewardsDescriptionPointsTicket,
    icon: <RewardsPoint />,
    textKey: 'Points',
  },
  [REWARDS_NAMES.CASHBACK]: {
    styles: styles.OrderRewardsDescriptionCashbackTicket,
    icon: <RewardsCashback color="#1c1c1c" />,
    textKey: 'Cashback',
  },
};

const OrderRewardsDescription = () => {
  const { t } = useTranslation(['Rewards']);
  const orderRewards = useSelector(getOrderRewards);

  return (
    <div className={styles.OrderRewardsDescription}>
      <div className={styles.OrderRewardsDescriptionGetRewardsContainer}>
        <h3 className={styles.OrderRewardsDescriptionGetRewardsTitle}>{t('JoinMembershipGetRewardsTitle')}</h3>
        <ul className={styles.OrderRewardsDescriptionTicketList}>
          {orderRewards.map(reward => (
            <li key={`rewards-description-ticket-${reward.key}`} className={styles.OrderRewardsDescriptionTicketItem}>
              <Ticket
                className={styles.OrderRewardsDescriptionTicketContainer}
                ticketClassName={`${REWARDS_UI_SETTINGS[reward.key].styles} ${styles.OrderRewardsDescriptionTicket}`}
                stubClassName={styles.OrderRewardsDescriptionTicketStub}
                main={REWARDS_UI_SETTINGS[reward.key].icon}
                stub={
                  <>
                    <data className={styles.OrderRewardsDescriptionTicketValue} value={reward.value}>
                      {reward.value}
                    </data>
                    <span className={styles.OrderRewardsDescriptionTicketText}>
                      {t(REWARDS_UI_SETTINGS[reward.key].textKey)}
                    </span>
                  </>
                }
              />
            </li>
          ))}
        </ul>
        <p className={styles.OrderRewardsDescriptionJoinMembershipDescription}>
          {t('JoinMembershipGetRewardsDescription')}
        </p>
        <DirectionArrow className={styles.OrderRewardsDescriptionGetRewardsDirectionArrow} />
      </div>
    </div>
  );
};

OrderRewardsDescription.displayName = 'OrderRewardsDescription';

export default OrderRewardsDescription;
