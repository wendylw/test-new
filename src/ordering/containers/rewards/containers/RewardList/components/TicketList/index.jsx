import React from 'react';
import { useTranslation } from 'react-i18next';
import Ticket from '../../../../../../../common/components/Ticket';
// import Tag from '../../../../../../../common/components/Tag';
import styles from './TicketList.module.scss';

const TicketList = () => {
  const { t } = useTranslation(['OrderingPromotion']);

  return (
    <section className={styles.TicketListContainer}>
      <h3 className={styles.TicketListTitle}>{t('YourVouchers')}</h3>
      <ul className={styles.TicketList}>
        <li>
          <Ticket
            className={styles.RewardTicketContainer}
            ticketClassName={styles.RewardTicket}
            orientation="vertical"
            main={
              <div className={styles.RewardTicketInfoTop}>
                <div className={styles.RewardTicketDescription}>
                  <data className={styles.RewardTicketDiscount} value="100%">
                    {t('DiscountValueText', { discount: '100%' })}
                  </data>
                  <h5 className={styles.RewardTicketDiscountName}>test</h5>
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
      </ul>
    </section>
  );
};

TicketList.displayName = 'TicketList';

export default TicketList;
