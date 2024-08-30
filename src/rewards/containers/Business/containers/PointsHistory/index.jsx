import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import RewardsPointsHistoryBannerImage from '../../../../../images/rewards-points-history-banner.svg';
import CleverTap from '../../../../../utils/clevertap';
import { getCustomerAvailablePointsBalance } from '../../../../redux/modules/customer/selectors';
import { getPointsHistoryList, getIsPointsHistoryListEmpty } from './redux/selectors';
import { actions as PointsHistoryActions } from './redux';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import { HistoryBanner, HistoryList } from '../../components/Histories';
import EarnedPointsPromptDrawer from './components/EarnedPointsPromptDrawer';
import styles from './PointsHistory.module.scss';

const PointsHistory = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const customerAvailablePointsBalance = useSelector(getCustomerAvailablePointsBalance);
  const pointsHistoryList = useSelector(getPointsHistoryList);
  const isPointsHistoryListEmpty = useSelector(getIsPointsHistoryListEmpty);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickHowToUseButton = useCallback(() => {
    CleverTap.pushEvent('Points Details Page - Click How to use points');

    dispatch(PointsHistoryActions.earnedPointsPromptDrawerShown());
  }, [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('PointsDetail')} onBackArrowClick={handleClickHeaderBackButton} />
      <HistoryBanner
        title={t('PointsBalanceTitle')}
        value={customerAvailablePointsBalance}
        valueText={t('CustomerPoints', { customerAvailablePointsBalance })}
        prompt={t('PointsExpiringTimePrompt')}
        infoButtonText={t('HowToUsePoints')}
        historyBannerImage={RewardsPointsHistoryBannerImage}
        onClickInfoButton={handleClickHowToUseButton}
        infoButtonTestId="rewards.business.points-history.how-to-use-button"
      />
      <section className={styles.PointsHistorySection}>
        <h2 className={styles.PointsHistoryListTitle}>{t('PointsHistory')}</h2>
        <HistoryList
          isEmpty={isPointsHistoryListEmpty}
          emptyTitle={t('NoPointsCollectedTitle')}
          emptyDescription={t('NoPointsCollectedDescription')}
          historyList={pointsHistoryList}
        />
      </section>
      <EarnedPointsPromptDrawer />
    </Frame>
  );
};

PointsHistory.displayName = 'PointsHistory';

export default PointsHistory;
