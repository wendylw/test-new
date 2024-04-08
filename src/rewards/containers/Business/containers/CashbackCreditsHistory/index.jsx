import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { formatTimeToDateString } from '../../../../../utils/datetime-lib';
import { getMerchantCountry } from '../../../../../redux/modules/merchant/selectors';
import { getDisplayCashbackExpiredDate } from '../../../../redux/modules/customer/selectors';
import { getCustomerCashbackPrice } from '../../redux/common/selectors';
import { getCashbackCreditsHistoryList, getIsCashbackCreditsHistoryListEmpty } from './redux/selectors';
import { actions as CashbackHistoryActions } from './redux';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import HistoryBanner from '../../components/Histories/HistoryBanner';
import HistoryList from '../../components/Histories/HistoryList';
import EarnedCashbackPromptDrawer from './components/EarnedCashbackPromptDrawer';
import styles from './CashbackHistory.module.scss';

const CashbackHistory = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const merchantCountry = useSelector(getMerchantCountry);
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const displayCashbackExpiredDate = useSelector(getDisplayCashbackExpiredDate);
  const cashbackCreditsHistoryList = useSelector(getCashbackCreditsHistoryList);
  const isCashbackCreditsHistoryListEmpty = useSelector(getIsCashbackCreditsHistoryListEmpty);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickHowToUseButton = useCallback(() => dispatch(CashbackHistoryActions.useCashbackPromptDrawerShown()), [
    dispatch,
  ]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('CashbackDetails')} onBackArrowClick={handleClickHeaderBackButton} />
      <HistoryBanner
        title={t('CashbackBalance')}
        value={customerCashbackPrice}
        valueText={customerCashbackPrice}
        prompt={t('ValidUntil', {
          date: formatTimeToDateString(merchantCountry, displayCashbackExpiredDate),
        })}
        infoButtonText={t('HowToUseCashback')}
        onClickInfoButton={handleClickHowToUseButton}
        infoButtonTestId="rewards.business.cashback-history.how-to-use-button"
      />
      <section className={styles.CashbackHistorySection}>
        <h2 className={styles.CashbackHistoryListTitle}>{t('CashbackHistory')}</h2>
        <HistoryList
          isEmpty={isCashbackCreditsHistoryListEmpty}
          emptyTitle={t('NoCashbackCollectedTitle')}
          emptyDescription={t('NoCashbackCollectedDescription')}
          historyList={cashbackCreditsHistoryList}
        />
      </section>
      <EarnedCashbackPromptDrawer />
    </Frame>
  );
};

CashbackHistory.displayName = 'CashbackHistory';

export default CashbackHistory;
