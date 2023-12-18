import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { PROMO_VOUCHER_STATUS } from '../../../../../../../common/utils/constants';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getUniquePromoList } from '../../redux/selectors';
import Tag from '../../../../../../../common/components/Tag';
import styles from './UniquePromoList.module.scss';

const UNIQUE_PROMO_STATUS_I18KEYS = {
  [PROMO_VOUCHER_STATUS.EXPIRED]: 'Expired',
  [PROMO_VOUCHER_STATUS.REDEEMED]: 'Redeemed',
};
const UniquePromoList = () => {
  const { t } = useTranslation(['Rewards']);
  const uniquePromoList = useSelector(getUniquePromoList);

  return (
    <section className={styles.UniquePromoListSection}>
      <h2 className={styles.UniquePromoListSectionTitle}>{t('UniquePromoListTitle')}</h2>
      <ul className={styles.UniquePromoList}>
        {uniquePromoList.map(uniquePromo => {
          const uniquePromoInfoTopClassList = [styles.UniquePromoInfoTop];
          const uniquePromoInfoBottomClassList = [styles.UniquePromoInfoBottom];
          const uniquePromoLimitationListClassList = [styles.UniquePromoLimitationList];
          const { id, value, name, limitations, status, isUnavailable } = uniquePromo;

          if (isUnavailable) {
            uniquePromoInfoTopClassList.push(styles.UniquePromoInfoTop__Unavailable);
            uniquePromoInfoBottomClassList.push(styles.UniquePromoInfoBottom__Unavailable);
            uniquePromoLimitationListClassList.push(styles.UniquePromoLimitationList__Unavailable);
          }

          return (
            <li className={styles.UniquePromoCard} key={id}>
              <div className={getClassName(uniquePromoInfoTopClassList)}>
                <data className={styles.UniquePromoDiscount} value={value}>
                  {t('DiscountValueText', { discount: value })}
                </data>
                <h5 className={styles.UniquePromoDiscountName}>{name}</h5>
              </div>
              <div className={getClassName(uniquePromoInfoBottomClassList)}>
                <ul className={getClassName(uniquePromoLimitationListClassList)}>
                  {limitations.map(({ key, i18nKey, params }) => (
                    <li className={styles.UniquePromoDiscountLimitation} key={key}>
                      {t(i18nKey, params)}
                    </li>
                  ))}
                </ul>
                {isUnavailable && (
                  <Tag className={styles.UniquePromoStatusTag}>{t(UNIQUE_PROMO_STATUS_I18KEYS[status])}</Tag>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

UniquePromoList.displayName = 'UniquePromoList';

export default UniquePromoList;
