import React from 'react';
import { useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { formatTimeToDateString } from '../../../../../../../utils/datetime-lib';
import { getMerchantCountry } from '../../../../../../../redux/modules/merchant/selectors';
import {
  getIsCashbackExpired,
  getDisplayCashbackExpiredDate,
} from '../../../../../../redux/modules/customer/selectors';
import {
  getIsExpiringTagShown,
  getIsTodayExpired,
  getRemainingCashbackExpiredDays,
  getCustomerCashbackPrice,
} from '../../../../redux/common/selectors';
import Tag from '../../../../../../../common/components/Tag';
import HistoryBanner from '../../../../components/Histories/HistoryBanner';
import styles from './CashbackStoreCreditsCard.module.scss';

const CashbackStoreCreditsCard = () => {
  const { t } = useTranslation(['Rewards']);
  const merchantCountry = useSelector(getMerchantCountry);
  const isCashbackExpired = useSelector(getIsCashbackExpired);
  const isExpiringTagShown = useSelector(getIsExpiringTagShown);
  const isTodayExpired = useSelector(getIsTodayExpired);
  const remainingCashbackExpiredDays = useSelector(getRemainingCashbackExpiredDays);
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const displayCashbackExpiredDate = useSelector(getDisplayCashbackExpiredDate);

  return (
    <section className={styles.CashbackStoreCreditsCardSection}>
      <div className={styles.CashbackStoreCreditsCard}>
        <HistoryBanner
          title={t('CashbackBalance')}
          value={customerCashbackPrice}
          valueText={customerCashbackPrice}
          prompt={
            <>
              {t('ValidUntil', {
                date: formatTimeToDateString(merchantCountry, displayCashbackExpiredDate),
              })}
              {isCashbackExpired && <Tag className={styles.CashbackStoreCreditsCardExpiredTag}>{t('Expired')}</Tag>}
              {isExpiringTagShown ? (
                <Tag color="red" className={styles.CashbackStoreCreditsCardRemainingExpiredDaysTag}>
                  {isTodayExpired ? (
                    t('ExpiringToday')
                  ) : (
                    <Trans
                      t={t}
                      i18nKey="ExpiringInDays"
                      values={{ remainingExpiredDays: remainingCashbackExpiredDays }}
                      components={[
                        <span
                          className={
                            remainingCashbackExpiredDays <= 1
                              ? styles.CashbackStoreCreditsCardRemainingExpiredDaysTagExtraTextHide
                              : ''
                          }
                        />,
                      ]}
                    />
                  )}
                </Tag>
              ) : null}
            </>
          }
          infoButtonText={t('HowToUseCashback')}
          onClickInfoButton={() => {}}
          infoButtonTestId="rewards.business.membership-detail.cashback.how-to-use-button"
        />
      </div>
    </section>
  );
};

CashbackStoreCreditsCard.displayName = 'CashbackStoreCreditsCard';

export default CashbackStoreCreditsCard;
