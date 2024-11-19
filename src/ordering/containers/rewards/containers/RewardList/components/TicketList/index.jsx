import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { UNIQUE_PROMO_STATUS_I18KEYS } from '../../../../../../../common/utils/rewards/constants';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getRewardList } from '../../redux/selectors';
import Ticket from '../../../../../../../common/components/Ticket';
import Tag from '../../../../../../../common/components/Tag';
import styles from './TicketList.module.scss';

const TicketList = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const rewardList = useSelector(getRewardList);

  return (
    <section className={styles.RewardTicketListContainer}>
      <h3 className={styles.RewardTicketListTitle}>{t('YourVouchers')}</h3>
      <ul className={styles.RewardTicketList}>
        {rewardList.map(reward => {
          const { key, value, name, isUnavailable, status, expiringDaysI18n, expiringDateI18n, minSpendI18n } = reward;

          return (
            <li key={key}>
              <Ticket
                className={styles.RewardTicketContainer}
                ticketClassName={getClassName([
                  styles.RewardTicket,
                  isUnavailable ? styles.RewardTicket__Unavailable : null,
                ])}
                orientation="vertical"
                main={
                  <div className={styles.RewardTicketInfoTop}>
                    <div className={styles.RewardTicketDescription}>
                      <data className={styles.RewardTicketDiscount} value={value}>
                        {t('DiscountValueText', { discount: value })}
                      </data>
                      <h5 className={styles.RewardTicketDiscountName}>{name}</h5>
                    </div>
                    {isUnavailable ? (
                      <Tag className={styles.RewardTicketStatusTag}>{t(UNIQUE_PROMO_STATUS_I18KEYS[status])}</Tag>
                    ) : expiringDaysI18n ? (
                      <Tag color="red">{t(expiringDaysI18n.i18nKey, expiringDaysI18n.params)}</Tag>
                    ) : (
                      <Tag className={styles.RewardTicketExpiringTag}>
                        {t(expiringDateI18n.i18nKey, expiringDateI18n.params)}
                      </Tag>
                    )}
                  </div>
                }
                stub={
                  <div className={styles.RewardTicketInfoBottom}>
                    <span className={styles.RewardTicketDiscountLimitation}>
                      {t(minSpendI18n.i18nKey, minSpendI18n.params)}
                    </span>
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
