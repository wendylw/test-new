import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { PROMO_VOUCHER_STATUS } from '../../../../../common/utils/constants';
import { getClassName } from '../../../../../common/utils/ui';
import CleverTap from '../../../../../utils/clevertap';
import { getUniquePromoList } from '../../redux/common/selectors';
import Tag from '../../../../../common/components/Tag';
import Button from '../../../../../common/components/Button';
import Ticket from '../Ticket';
import styles from './UniquePromoList.module.scss';

const UNIQUE_PROMO_STATUS_I18KEYS = {
  [PROMO_VOUCHER_STATUS.EXPIRED]: 'Expired',
  [PROMO_VOUCHER_STATUS.REDEEMED]: 'Redeemed',
};
const UniquePromoList = () => {
  const { t } = useTranslation(['Rewards']);
  const uniquePromoList = useSelector(getUniquePromoList);
  const handleClickRewardItem = useCallback(() => {
    CleverTap.pushEvent('My Rewards Page - Click Reward (My Rewards)');
  }, []);

  if (uniquePromoList.length === 0) {
    return null;
  }

  return (
    <ul className={styles.UniquePromoList}>
      {uniquePromoList.map(uniquePromo => {
        const uniquePromoInfoTopClassList = [styles.UniquePromoInfoTop];
        const uniquePromoInfoBottomClassList = [styles.UniquePromoInfoBottom];
        const uniquePromoDiscountLimitationClassList = [styles.UniquePromoDiscountLimitation];
        const { key: uniquePromoKey, value, name, expiringDate, minSpend, status, isUnavailable } = uniquePromo;

        if (isUnavailable) {
          uniquePromoInfoTopClassList.push(styles.UniquePromoInfoTop__Unavailable);
          uniquePromoInfoBottomClassList.push(styles.UniquePromoInfoBottom__Unavailable);
          uniquePromoDiscountLimitationClassList.push(styles.UniquePromoDiscountLimitation__Unavailable);
        }

        return (
          <li key={uniquePromoKey}>
            <Button
              block
              type="text"
              theme="ghost"
              data-test-id="rewards.my-rewards-page.reward"
              className={styles.UniquePromoButton}
              contentClassName={styles.UniquePromoButtonContent}
              onClick={handleClickRewardItem}
            >
              <Ticket
                className={styles.UniquePromoTicketContainer}
                ticketClassName={styles.UniquePromoTicket}
                orientation="vertical"
                main={
                  <div className={getClassName(uniquePromoInfoTopClassList)}>
                    <div className={styles.UniquePromoDescription}>
                      <data className={styles.UniquePromoDiscount} value={value}>
                        {t('DiscountValueText', { discount: value })}
                      </data>
                      <h5 className={styles.UniquePromoDiscountName}>{name}</h5>
                    </div>
                    {isUnavailable ? (
                      <Tag className={styles.UniquePromoStatusTag}>{t(UNIQUE_PROMO_STATUS_I18KEYS[status])}</Tag>
                    ) : (
                      <Tag className={styles.UniqueExpiringTag}>{t(expiringDate.i18nKey, expiringDate.params)}</Tag>
                    )}
                  </div>
                }
                stub={
                  <div className={getClassName(uniquePromoInfoBottomClassList)}>
                    <span className={getClassName(uniquePromoDiscountLimitationClassList)}>
                      {t(minSpend.i18nKey, minSpend.params)}
                    </span>
                    <span className={styles.UniquePromoViewDetail}>{t('ViewDetails')}</span>
                  </div>
                }
              />
            </Button>
          </li>
        );
      })}
    </ul>
  );
};

UniquePromoList.displayName = 'UniquePromoList';

export default UniquePromoList;
