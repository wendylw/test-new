import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CashbackHistoryButtonIcon from '../../../../../images/membership-history.svg';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { formatTimeToDateString } from '../../../../../utils/datetime-lib';
import { getClassName } from '../../../../../common/utils/ui';
import {
  getMerchantBusiness,
  getMerchantCountry,
  getIsMerchantEnabledCashback,
} from '../../../../../redux/modules/merchant/selectors';
import { getCashbackExpiredDate, getIsCashbackExpired } from '../../../../redux/modules/customer/selectors';
import { getCustomerCashbackPrice, getRemainingCashbackExpiredDays } from '../../redux/common/selectors';
import Tag from '../../../../../common/components/Tag';
import styles from './CashbackBlock.module.scss';

const CashbackBlock = () => {
  const { t } = useTranslation(['Rewards']);
  const merchantBusiness = useSelector(getMerchantBusiness);
  const merchantCountry = useSelector(getMerchantCountry);
  const isMerchantEnabledCashback = useSelector(getIsMerchantEnabledCashback);
  const cashbackExpiredDate = useSelector(getCashbackExpiredDate);
  const isCashbackExpired = useSelector(getIsCashbackExpired);
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const remainingCashbackExpiredDays = useSelector(getRemainingCashbackExpiredDays);
  const cashbackHistoryLogPageURL = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace(
    '%business%',
    merchantBusiness
  )}${PATH_NAME_MAPPING.CASHBACK_BASE}${PATH_NAME_MAPPING.CASHBACK_HISTORIES}`;
  const isTodayExpired = remainingCashbackExpiredDays === 0;
  const cashbackBlockBalanceContainerClassName = getClassName([
    styles.CashbackBlockBalanceContainer,
    isCashbackExpired ? styles.CashbackBlockBalanceContainer__Expired : null,
  ]);
  const cashbackBlockExpiredDateClassName = getClassName([
    styles.CashbackBlockExpiredDate,
    isCashbackExpired ? styles.CashbackBlockExpiredDate__Expired : null,
  ]);

  if (!isMerchantEnabledCashback) {
    return null;
  }

  return (
    <section className={styles.CashbackBlockSection}>
      <h2 className={styles.CashbackBlockSectionTitle}>{t('Cashback')}</h2>
      <div className={styles.CashbackBlock}>
        <div className={styles.CashbackBlockInfoTop}>
          <div className={cashbackBlockBalanceContainerClassName}>
            <h4 className={styles.CashbackBlockBalanceTitle}>{t('CashbackBalanceTitle')} :</h4>
            <data className={styles.CashbackBlockBalance} value={customerCashbackPrice}>
              {customerCashbackPrice}
            </data>
          </div>
          <a
            className={styles.CashbackBlockHistoryLink}
            data-test-id="rewards.membership-detail.cashback-history-link"
            href={cashbackHistoryLogPageURL}
          >
            <img
              className={styles.CashbackBlockHistoryLinkImage}
              src={CashbackHistoryButtonIcon}
              alt="Store cashback history in StoreHub"
            />
          </a>
        </div>
        {cashbackExpiredDate && (
          <div className={styles.CashbackBlockInfoBottom}>
            <time className={cashbackBlockExpiredDateClassName}>
              {t('ValidUntil', {
                date: formatTimeToDateString(merchantCountry, cashbackExpiredDate),
              })}
            </time>
            {isCashbackExpired && <Tag className={styles.CashbackBlockExpiredTag}>{t('Expired')}</Tag>}
            {remainingCashbackExpiredDays && (
              <Tag className={styles.CashbackBlockRemainingExpiredDaysTag}>
                {isTodayExpired ? t('ExpiringToday') : t('ExpiringInDays', { remainingCashbackExpiredDays })}
              </Tag>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

CashbackBlock.displayName = 'CashbackBlock';

export default CashbackBlock;
