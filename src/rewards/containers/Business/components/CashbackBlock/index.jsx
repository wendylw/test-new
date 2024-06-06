import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CashbackHistoryButtonIcon from '../../../../../images/membership-history.svg';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { formatTimeToDateString } from '../../../../../utils/datetime-lib';
import { getClassName } from '../../../../../common/utils/ui';
import { getMerchantCountry } from '../../../../../redux/modules/merchant/selectors';
import { getDisplayCashbackExpiredDate, getIsCashbackExpired } from '../../../../redux/modules/customer/selectors';
import { getLocationSearch } from '../../../../redux/modules/common/selectors';
import {
  getCustomerCashbackPrice,
  getRemainingCashbackExpiredDays,
  getIsTodayExpired,
  getIsExpiringTagShown,
} from '../../redux/common/selectors';
import Button from '../../../../../common/components/Button';
import Tag from '../../../../../common/components/Tag';
import styles from './CashbackBlock.module.scss';

const CashbackBlock = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const merchantCountry = useSelector(getMerchantCountry);
  const search = useSelector(getLocationSearch);
  const displayCashbackExpiredDate = useSelector(getDisplayCashbackExpiredDate);
  const isCashbackExpired = useSelector(getIsCashbackExpired);
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const isExpiringTagShown = useSelector(getIsExpiringTagShown);
  const remainingCashbackExpiredDays = useSelector(getRemainingCashbackExpiredDays);
  const isTodayExpired = useSelector(getIsTodayExpired);
  const cashbackBlockBalanceContainerClassName = getClassName([
    styles.CashbackBlockBalanceContainer,
    isCashbackExpired ? styles.CashbackBlockBalanceContainer__Expired : null,
  ]);
  const cashbackBlockExpiredDateClassName = getClassName([
    styles.CashbackBlockExpiredDate,
    isCashbackExpired ? styles.CashbackBlockExpiredDate__Expired : null,
  ]);
  const handleHistoryButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.CASHBACK_CREDITS_HISTORY}`,
      search,
    });
  }, [history, search]);

  return (
    <div className={styles.CashbackBlock}>
      <div className={styles.CashbackBlockInfoTop}>
        <div className={cashbackBlockBalanceContainerClassName}>
          <h4 className={styles.CashbackBlockBalanceTitle}>{t('CashbackBalanceTitle')} :</h4>
          <data className={styles.CashbackBlockBalance} value={customerCashbackPrice}>
            {customerCashbackPrice}
          </data>
        </div>
        <Button
          className={styles.CashbackBlockHistoryLink}
          data-test-id="rewards.membership-detail.cashback-history-link"
          type="text"
          size="small"
          onClick={handleHistoryButtonClick}
        >
          <img
            className={styles.CashbackBlockHistoryLinkImage}
            src={CashbackHistoryButtonIcon}
            alt="Store cashback history in StoreHub"
          />
        </Button>
      </div>
      {displayCashbackExpiredDate && (
        <div className={styles.CashbackBlockInfoBottom}>
          <time className={cashbackBlockExpiredDateClassName}>
            {t('ValidUntil', {
              date: formatTimeToDateString(merchantCountry, displayCashbackExpiredDate),
            })}
          </time>
          {isCashbackExpired && <Tag className={styles.CashbackBlockExpiredTag}>{t('Expired')}</Tag>}
          {isExpiringTagShown ? (
            <Tag color="red" className={styles.CashbackBlockRemainingExpiredDaysTag}>
              {isTodayExpired
                ? t('ExpiringToday')
                : t('ExpiringInDays', { remainingExpiredDays: remainingCashbackExpiredDays })}
            </Tag>
          ) : null}
        </div>
      )}
    </div>
  );
};

CashbackBlock.displayName = 'CashbackBlock';

export default CashbackBlock;
