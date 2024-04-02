import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { Info } from 'phosphor-react';
import RewardsHistoryBannerImage from '../../../../../images/rewards-history-banner.svg';
import RewardsEmptyListImage from '../../../../../images/rewards-empty-list-icon.svg';
import { getCustomerAvailablePointsBalance } from '../../../../redux/modules/customer/selectors';
import { getPointsHistoryList, getIsPointsHistoryListEmpty } from './redux/selectors';
import { actions as PointsHistoryActions } from './redux';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import Button from '../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../common/components/Image';
import EarnedPointsPromptDrawer from './components/EarnedPointsPromptDrawer';
import styles from './PointsHistory.module.scss';

const PointsHistory = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const customerAvailablePointsBalance = useSelector(getCustomerAvailablePointsBalance);
  const pointsHistoryList = useSelector(getPointsHistoryList);
  const isPointsHistoryListEmpty = useSelector(getIsPointsHistoryListEmpty);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickHowToUseButton = useCallback(() => dispatch(PointsHistoryActions.earnedPointsPromptDrawerShown()), [
    dispatch,
  ]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('PointsDetail')} onBackArrowClick={handleClickHeaderBackButton} />
      <section className={styles.PointsHistoryBanner}>
        <div className={styles.PointsHistoryBannerCustomerInfo}>
          <h4 className={styles.PointsHistoryBannerTitle}>{t('PointsBalanceTitle')}:</h4>
          <data className={styles.PointsHistoryBannerPoints} value={customerAvailablePointsBalance}>
            {t('CustomerPoints', { customerAvailablePointsBalance })}
          </data>
          <div className={styles.PointsHistoryBannerPrompts}>
            <p className={styles.PointsHistoryBannerExpiringTimePrompt}>{t('PointsExpiringTimePrompt')}</p>
            <Button
              className={styles.PointsHistoryBannerHowToUseButton}
              contentClassName={styles.PointsHistoryBannerHowToUseButtonContent}
              type="text"
              size="small"
              theme="info"
              data-test-id="rewards.business.points-history.how-to-use-button"
              icon={<Info size={18} />}
              onClick={handleClickHowToUseButton}
            >
              {t('HowToUsePoints')}
            </Button>
          </div>
        </div>
        <div className={styles.PointsHistoryBannerImage}>
          <ObjectFitImage noCompression src={RewardsHistoryBannerImage} alt="Beep Rewards Banner" />
        </div>
      </section>
      <section className={styles.PointsHistorySection}>
        <h2 className={styles.PointsHistoryListTitle}>{t('PointsHistory')}</h2>
        {isPointsHistoryListEmpty ? (
          <section className={styles.PointsHistoryListEmptySection}>
            <div className={styles.PointsHistoryListEmptyImage}>
              <ObjectFitImage noCompression src={RewardsEmptyListImage} />
            </div>
            <h4 className={styles.PointsHistoryListEmptyTitle}>{t('NoPointsCollectedTitle')}</h4>
            <p className={styles.PointsHistoryListEmptyDescription}>{t('NoPointsCollectedDescription')}</p>
          </section>
        ) : (
          <ul className={styles.PointsHistoryList}>
            {pointsHistoryList.map(pointsHistoryItem => {
              const { id, nameI18nKey, logDateTime, changePoints, isReduce } = pointsHistoryItem || {};

              return (
                <li key={id} className={styles.PointsHistoryItem}>
                  <div>
                    <h4 className={styles.PointsHistoryItemTitle}>{t(nameI18nKey)}</h4>
                    <time className={styles.PointsHistoryItemDateTime}>{logDateTime}</time>
                  </div>
                  <data
                    className={isReduce ? styles.PointsHistoryItemReduceAmount : styles.PointsHistoryItemIncreaseAmount}
                    value={changePoints}
                  >
                    {t('ChangePointsText', { changedPoints: changePoints })}
                  </data>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <EarnedPointsPromptDrawer />
    </Frame>
  );
};

PointsHistory.displayName = 'PointsHistory';

export default PointsHistory;
