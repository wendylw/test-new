import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { Info } from 'phosphor-react';
import RewardsHistoryBanner from '../../../../../images/rewards-history-banner.svg';
import { getCustomerAvailablePointsBalance } from '../../../../redux/modules/customer/selectors';
import { getPointsHistoryList } from './redux/selectors';
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
          <ObjectFitImage noCompression src={RewardsHistoryBanner} alt="Beep Rewards Banner" />
        </div>
      </section>
      <section>
        <h2 className={styles.PointsHistoryListTitle}>{t('PointsHistory')}</h2>
        <ul>
          {pointsHistoryList.map(pointsHistoryItem => {
            const { id, nameI18nKey, logDateTime, changeAmount, isReduce } = pointsHistoryItem || {};

            return (
              <li key={id}>
                <div>
                  <h4 className={styles.PointsHistoryItemTitle}>{t(nameI18nKey)}</h4>
                  <time className={styles.PointsHistoryItemDateTime}>{logDateTime}</time>
                </div>
                <data
                  className={isReduce ? styles.PointsHistoryItemReduceAmount : styles.PointsHistoryItemIncreaseAmount}
                  value={changeAmount}
                >
                  {t('ChangePointsText', { changedPoints: changeAmount })}
                </data>
              </li>
            );
          })}
        </ul>
      </section>
      <EarnedPointsPromptDrawer />
    </Frame>
  );
};

PointsHistory.displayName = 'PointsHistory';

export default PointsHistory;
