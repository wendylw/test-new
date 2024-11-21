import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { PROMO_VOUCHER_STATUS, PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { getClassName } from '../../../../../common/utils/ui';
import CleverTap from '../../../../../utils/clevertap';
import { getLocationSearch } from '../../../../redux/modules/common/selectors';
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
  const history = useHistory();
  const search = useSelector(getLocationSearch);
  const uniquePromoList = useSelector(getUniquePromoList);
  const handleClickRewardItem = useCallback(
    (id, uniquePromotionId) => {
      const myRewardDetail = {
        pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.DETAIL}`,
        search: `${search || '?'}&id=${id}&uniquePromotionId=${uniquePromotionId}`,
      };

      CleverTap.pushEvent('My Rewards Page - Click Reward (My Rewards)');

      history.push(myRewardDetail);
    },
    [history, search]
  );

  if (uniquePromoList.length === 0) {
    return null;
  }

  return (
    <ul className={styles.UniquePromoList}>
      {uniquePromoList.map(uniquePromo => {
        const uniquePromoInfoTopClassList = [styles.UniquePromoInfoTop];
        const uniquePromoInfoBottomClassList = [styles.UniquePromoInfoBottom];
        const uniquePromoDiscountLimitationClassList = [styles.UniquePromoDiscountLimitation];
        const {
          key: uniquePromoKey,
          id,
          uniquePromotionId,
          value,
          name,
          expiringDate,
          minSpend,
          status,
          isUnavailable,
          conditions,
        } = uniquePromo;
        const { expiringDays } = conditions;

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
              onClick={() => {
                handleClickRewardItem(id, uniquePromotionId);
              }}
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
                    ) : expiringDays ? (
                      <Tag color="red" className={styles.UniquePromStubRemainingExpiredDaysTag}>
                        <Trans
                          t={t}
                          i18nKey={expiringDays.i18nKey}
                          values={expiringDays.params}
                          components={[
                            <span
                              className={
                                expiringDays.value === 1
                                  ? styles.UniquePromStubRemainingExpiredDaysTagLetterHidden
                                  : styles.UniquePromStubRemainingExpiredDaysTagLetter
                              }
                            />,
                          ]}
                        />
                      </Tag>
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
