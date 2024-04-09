import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import RewardsStoreCreditsHistoryBannerImage from '../../../../../images/rewards-store-credits-history-banner.svg';
import { getCustomerCashbackPrice } from '../../redux/common/selectors';
import { getStoreCreditsHistoryList, getIsStoreCreditsHistoryListEmpty } from './redux/selectors';
import { actions as cashbackCreditsHistoryActions } from './redux';
import { backButtonClicked } from './redux/thunks';
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
  const storeCreditsHistoryList = useSelector(getStoreCreditsHistoryList);
  const isStoreCreditsHistoryListEmpty = useSelector(getIsStoreCreditsHistoryListEmpty);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickHowToUseButton = useCallback(
    () => dispatch(cashbackCreditsHistoryActions.useStoreCreditsPromptDrawerShown()),
    [dispatch]
  );

  return (
    <Frame>
      <PageHeader title={t('StoreCreditDetails')} onBackArrowClick={handleClickHeaderBackButton} />
      <HistoryBanner
        title={t('StoreCreditsBalance')}
        value={customerCashbackPrice}
        valueText={customerCashbackPrice}
        prompt=""
        infoButtonText={t('HowToUseStoreCredits')}
        historyBannerImage={RewardsStoreCreditsHistoryBannerImage}
        onClickInfoButton={handleClickHowToUseButton}
        infoButtonTestId="rewards.business.store-credits-history.how-to-use-button"
      />
      <section className={styles.StoreCreditsHistorySection}>
        <h2 className={styles.StoreCreditsHistoryListTitle}>{t('StoreCreditsHistory')}</h2>
        <HistoryList
          isEmpty={isStoreCreditsHistoryListEmpty}
          emptyTitle={t('NoCashbackCollectedTitle')}
          emptyDescription={t('NoCashbackCollectedDescription')}
          historyList={storeCreditsHistoryList}
        />
      </section>
      <EarnedCashbackPromptDrawer />
    </Frame>
  );
};

StoreCreditsHistory.displayName = 'StoreCreditsHistory';

export default StoreCreditsHistory;
