import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { getCustomerCashbackPrice } from '../../redux/common/selectors';
import { getCashbackCreditsHistoryList, getIsCashbackCreditsHistoryListEmpty } from './redux/selectors';
import { actions as CashbackHistoryActions } from './redux';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import HistoryBanner from '../../components/Histories/HistoryBanner';
import HistoryList from '../../components/Histories/HistoryList';
import EarnedCashbackPromptDrawer from './components/EarnedCashbackPromptDrawer';
import styles from './StoreCreditsHistory.module.scss';

const StoreCreditsHistory = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const cashbackCreditsHistoryList = useSelector(getCashbackCreditsHistoryList);
  const isCashbackCreditsHistoryListEmpty = useSelector(getIsCashbackCreditsHistoryListEmpty);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickHowToUseButton = useCallback(
    () => dispatch(CashbackHistoryActions.useStoreCreditsPromptDrawerShown()),
    [dispatch]
  );

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('StoreCreditDetails')} onBackArrowClick={handleClickHeaderBackButton} />
      <HistoryBanner
        title={t('StoreCreditsBalance')}
        value={customerCashbackPrice}
        valueText={customerCashbackPrice}
        prompt=""
        infoButtonText={t('HowToUseStoreCredits')}
        onClickInfoButton={handleClickHowToUseButton}
        infoButtonTestId="rewards.business.store-credits-history.how-to-use-button"
      />
      <section className={styles.StoreCreditsHistorySection}>
        <h2 className={styles.StoreCreditsHistoryListTitle}>{t('StoreCreditsHistory')}</h2>
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

StoreCreditsHistory.displayName = 'StoreCreditsHistory';

export default StoreCreditsHistory;
