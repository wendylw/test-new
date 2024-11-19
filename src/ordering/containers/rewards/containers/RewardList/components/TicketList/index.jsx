import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getRewardList } from '../../redux/selectors';
import Ticket from '../../../../../../../common/components/Ticket';
// import Tag from '../../../../../../../common/components/Tag';
import styles from './TicketList.module.scss';

const TicketList = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const rewardList = useSelector(getRewardList);

  return (
    <section className={styles.TicketListContainer}>
      <h3 className={styles.TicketListTitle}>{t('YourVouchers')}</h3>
      <ul className={styles.TicketList}>
        {rewardList.map(reward => {
          const { key, value, name } = reward;

          return (
            <li key={key}>
              <Ticket
                className={styles.RewardTicketContainer}
                ticketClassName={styles.RewardTicket}
                orientation="vertical"
                main={
                  <div className={styles.RewardTicketInfoTop}>
                    <div className={styles.RewardTicketDescription}>
                      <data className={styles.RewardTicketDiscount} value={value}>
                        {t('DiscountValueText', { discount: value })}
                      </data>
                      <h5 className={styles.RewardTicketDiscountName}>{name}</h5>
                    </div>
                    {/* {isUnavailable ? (
                  <Tag className={styles.RewardTicketStatusTag}>{t(UNIQUE_PROMO_STATUS_I18KEYS[status])}</Tag>
                ) : expiringDays ? (
                  <Tag color="red">{t(expiringDays.i18nKey, expiringDays.params)}</Tag>
                ) : (
                  <Tag className={styles.UniqueExpiringTag}>{t(expiringDate.i18nKey, expiringDate.params)}</Tag>
                )} */}
                  </div>
                }
                stub={
                  <div className={styles.RewardTicketInfoBottom}>
                    {/* <span className={styles.RewardTicketDiscountLimitation}>
                  {t(minSpend.i18nKey, minSpend.params)}
                </span> */}
                    <span className={styles.RewardTicketViewDetail}>{t('ViewDetails')}</span>
                  </div>
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

TicketList.displayName = 'TicketList';

export default TicketList;
