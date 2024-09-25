import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { Trans, useTranslation } from 'react-i18next';
import { formatTimeToDateString } from '../../../../../utils/datetime-lib';
import CleverTap from '../../../../../utils/clevertap';
import { getMerchantCountry } from '../../../../../redux/modules/merchant/selectors';
import { getIsCashbackExpired, getDisplayCashbackExpiredDate } from '../../../../redux/modules/customer/selectors';
import {
  getIsExpiringTagShown,
  getIsTodayExpired,
  getRemainingCashbackExpiredDays,
  getCustomerCashbackPrice,
  getCustomizeRewardsSettingsCashbackRate,
} from '../../redux/common/selectors';
import { getCashbackHistoryList, getIsCashbackHistoryListEmpty } from './redux/selectors';
import { actions as cashbackCreditsHistoryActions } from './redux';
import { backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import Tag from '../../../../../common/components/Tag';
import HistoryBanner from '../../components/Histories/HistoryBanner';
import HistoryList from '../../components/Histories/HistoryList';
import EarnedCashbackPromptDrawer from './components/EarnedCashbackPromptDrawer';
import styles from './CashbackHistory.module.scss';

const CashbackHistory = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const merchantCountry = useSelector(getMerchantCountry);
  const isCashbackExpired = useSelector(getIsCashbackExpired);
  const isExpiringTagShown = useSelector(getIsExpiringTagShown);
  const isTodayExpired = useSelector(getIsTodayExpired);
  const remainingCashbackExpiredDays = useSelector(getRemainingCashbackExpiredDays);
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const cashbackRate = useSelector(getCustomizeRewardsSettingsCashbackRate);
  const displayCashbackExpiredDate = useSelector(getDisplayCashbackExpiredDate);
  const cashbackHistoryList = useSelector(getCashbackHistoryList);
  const isCashbackHistoryListEmpty = useSelector(getIsCashbackHistoryListEmpty);
  const handleClickHeaderBackButton = useCallback(() => {
    CleverTap.pushEvent('Cashback Details Page - Click Back');

    dispatch(backButtonClicked());
  }, [dispatch]);
  const handleClickHowToUseButton = useCallback(() => {
    dispatch(cashbackCreditsHistoryActions.useCashbackPromptDrawerShown());
  }, [dispatch]);

  useMount(() => {
    CleverTap.pushEvent('Cashback Details Page - View Page');
  });

  return (
    <Frame>
      <PageHeader title={t('CashbackDetails')} onBackArrowClick={handleClickHeaderBackButton} />
      <HistoryBanner
        title={t('CashbackBalance')}
        value={customerCashbackPrice}
        valueText={customerCashbackPrice}
        prompt={
          <>
            {t('ValidUntil', {
              date: formatTimeToDateString(merchantCountry, displayCashbackExpiredDate),
            })}
            {isCashbackExpired && <Tag className={styles.CashbackHistoryExpiredTag}>{t('Expired')}</Tag>}
            {isExpiringTagShown ? (
              <Tag color="red" className={styles.CashbackHistoryRemainingExpiredDaysTag}>
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
                            ? styles.CashbackHistoryRemainingExpiredDaysTagExtraTextHide
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
        onClickInfoButton={handleClickHowToUseButton}
        infoButtonTestId="rewards.business.cashback-history.how-to-use-button"
      />
      <section className={styles.CashbackHistorySection}>
        <h2 className={styles.CashbackHistoryListTitle}>{t('CashbackHistory')}</h2>
        <HistoryList
          isEmpty={isCashbackHistoryListEmpty}
          emptyTitle={t('NoCashbackCollectedTitle')}
          emptyDescription={t('NoCashbackCollectedDescription', { cashbackRate })}
          historyList={cashbackHistoryList}
        />
      </section>
      <EarnedCashbackPromptDrawer />
    </Frame>
  );
};

CashbackHistory.displayName = 'CashbackHistory';

export default CashbackHistory;
