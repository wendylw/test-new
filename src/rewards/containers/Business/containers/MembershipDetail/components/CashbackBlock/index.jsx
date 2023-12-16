import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CashbackHistoryButtonIcon from '../../../../../../../images/membership-history.svg';
import { formatTime } from '../../../../../../../utils/time-lib';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { getMerchantBusiness, getIsMerchantEnabledCashback } from '../../../../../../redux/modules/merchant/selectors';
import { getCashbackExpiredDate, getIsCashbackExpired } from '../../../../../../redux/modules/customer/selectors';
import { getCustomerCashbackPrice } from '../../redux/selectors';
import Tag from '../../../../../../../common/components/Tag';
import styles from './CashbackBlock.module.scss';

const CashbackBlock = () => {
  // TODO: phase3 will add Expiring Remaining Days
  const { t } = useTranslation(['Rewards']);
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isMerchantEnabledCashback = useSelector(getIsMerchantEnabledCashback);
  const cashbackExpiredDate = useSelector(getCashbackExpiredDate);
  const isCashbackExpired = useSelector(getIsCashbackExpired);
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const cashbackHistoryLogPageURL = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace(
    '%business%',
    merchantBusiness
  )}${PATH_NAME_MAPPING.CASHBACK_BASE}${PATH_NAME_MAPPING.CASHBACK_HISTORIES}`;

  if (!isMerchantEnabledCashback) {
    return null;
  }

  return (
    <section className={styles.CashbackBlockSection}>
      <h2 className={styles.CashbackBlockSectionTitle}>{t('Cashback')}</h2>
      <div className={styles.CashbackBlock}>
        <div className={styles.CashbackBlockInfoTop}>
          <div className={styles.CashbackBlockBalanceContainer}>
            <h4 className={styles.CashbackBlockBalanceTitle}>{t('CashbackBalanceTitle')} :</h4>
            <data className={styles.CashbackBlockBalance} value={customerCashbackPrice}>
              {customerCashbackPrice}
            </data>
          </div>
          <a className={styles.CashbackBlockHistoryLink} href={cashbackHistoryLogPageURL}>
            <img
              className={styles.CashbackBlockHistoryLinkImage}
              src={CashbackHistoryButtonIcon}
              alt="Store cashback history in StoreHub"
            />
          </a>
        </div>
        <div className={styles.CashbackBlockInfoBottom}>
          <time className={styles.CashbackBlockExpiredDate}>
            {formatTime(cashbackExpiredDate, 'MMMM D, YYYY')}Valid until Jan 07, 2024
          </time>
          {isCashbackExpired && <Tag className={styles.CashbackBlockExpiredTag}>{t('Expired')}</Tag>}
        </div>
      </div>
    </section>
  );
};

CashbackBlock.displayName = 'CashbackBlock';

export default CashbackBlock;
