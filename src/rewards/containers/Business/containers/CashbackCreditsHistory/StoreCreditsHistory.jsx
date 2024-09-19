import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import RewardsStoreCreditsHistoryBannerImage from '../../../../../images/rewards-store-credits-history-banner.svg';
import CleverTap from '../../../../../utils/clevertap';
import { getCustomerCashbackPrice } from '../../redux/common/selectors';
import {
  getStoreCreditsHistoryList,
  getIsStoreCreditsHistoryListEmpty,
  getIsUseCashbackPromptDrawerShow,
} from './redux/selectors';
import { actions as cashbackCreditsHistoryActions } from './redux';
import { backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import HistoryBanner from '../../components/Histories/HistoryBanner';
import HistoryList from '../../components/Histories/HistoryList';
import EarnedStoreCreditsPromptDrawer from '../../components/EarnedStoreCreditsPromptDrawer';
import styles from './StoreCreditsHistory.module.scss';

const StoreCreditsHistory = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const storeCreditsHistoryList = useSelector(getStoreCreditsHistoryList);
  const isStoreCreditsHistoryListEmpty = useSelector(getIsStoreCreditsHistoryListEmpty);
  const isUseCashbackPromptDrawerShow = useSelector(getIsUseCashbackPromptDrawerShow);
  const handleClickHeaderBackButton = useCallback(() => {
    CleverTap.pushEvent('Store Credit Details Page - Click Back');

    dispatch(backButtonClicked());
  }, [dispatch]);
  const handleClickHowToUseButton = useCallback(
    () => dispatch(cashbackCreditsHistoryActions.useStoreCreditsPromptDrawerShown()),
    [dispatch]
  );
  const handleCloseEarnedCashbackPromptDrawer = useCallback(() => {
    dispatch(cashbackCreditsHistoryActions.useStoreCreditsPromptDrawerHidden());
  }, [dispatch]);

  useMount(() => {
    CleverTap.pushEvent('Store Credit Details Page - View Page');
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
        historyBannerImage={RewardsStoreCreditsHistoryBannerImage}
        onClickInfoButton={handleClickHowToUseButton}
        infoButtonTestId="rewards.business.store-credits-history.how-to-use-button"
      />
      <section className={styles.StoreCreditsHistorySection}>
        <h2 className={styles.StoreCreditsHistoryListTitle}>{t('StoreCreditsHistory')}</h2>
        <HistoryList
          isEmpty={isStoreCreditsHistoryListEmpty}
          emptyTitle={t('NoStoreCreditsCollectedTitle')}
          emptyDescription={t('NoStoreCreditsCollectedDescription')}
          historyList={storeCreditsHistoryList}
        />
      </section>
      <EarnedStoreCreditsPromptDrawer
        show={isUseCashbackPromptDrawerShow}
        onCloseDrawer={handleCloseEarnedCashbackPromptDrawer}
      />
    </Frame>
  );
};

StoreCreditsHistory.displayName = 'StoreCreditsHistory';

export default StoreCreditsHistory;
