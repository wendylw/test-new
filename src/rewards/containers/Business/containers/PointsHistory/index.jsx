import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLifecycles } from 'react-use';
import { Trans, useTranslation } from 'react-i18next';
import RewardsPointsHistoryBannerImage from '../../../../../images/rewards-points-history-banner.svg';
import { POINTS_EXPIRATION_DURATION_UNIT_I18N_KEYS } from './utils/constants';
import CleverTap from '../../../../../utils/clevertap';
import {
  getPointsExpirationDurationNumber,
  getPointsExpirationDurationUnit,
} from '../../../../../redux/modules/merchant/selectors';
import { getCustomerAvailablePointsBalance } from '../../../../redux/modules/customer/selectors';
import {
  getPointsHistoryList,
  getIsPointsHistoryListEmpty,
  getEmptyPromptEarnPointsNumber,
  getEmptyPromptBaseSpent,
  getIsPointsExpirationDurationPromptShow,
} from './redux/selectors';
import { actions as PointsHistoryActions } from './redux';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import { ObjectFitImage } from '../../../../../common/components/Image';
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
  const emptyPromptEarnPointsNumber = useSelector(getEmptyPromptEarnPointsNumber);
  const emptyPromptBaseSpent = useSelector(getEmptyPromptBaseSpent);
  const isPointsExpirationDurationPromptShow = useSelector(getIsPointsExpirationDurationPromptShow);
  const pointsExpirationDurationNumber = useSelector(getPointsExpirationDurationNumber);
  const pointsExpirationDurationUnit = useSelector(getPointsExpirationDurationUnit);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickHowToUseButton = useCallback(() => {
    CleverTap.pushEvent('Points Details Page - Click How to use points');

    dispatch(PointsHistoryActions.earnedPointsPromptDrawerShown());
  }, [dispatch]);

  useLifecycles(
    () => {
      dispatch(mounted());
    },
    () => dispatch(PointsHistoryActions.pointsHistoryReset())
  );

  return (
    <Frame>
      <PageHeader title={t('PointsDetail')} onBackArrowClick={handleClickHeaderBackButton} />
      <HistoryBanner
        title={t('PointsBalanceTitle')}
        value={customerAvailablePointsBalance}
        valueText={t('CustomerPoints', { customerAvailablePointsBalance })}
        promptClassName={styles.PointsHistoryBannerExpirationDuration}
        prompt={
          isPointsExpirationDurationPromptShow ? (
            <Trans
              t={t}
              i18nKey="PointsExpiringTimePrompt"
              values={{
                expirationDuration: t(POINTS_EXPIRATION_DURATION_UNIT_I18N_KEYS[pointsExpirationDurationUnit], {
                  count: pointsExpirationDurationNumber,
                }),
              }}
            />
          ) : null
        }
        infoButtonText={t('HowToUsePoints')}
        historyBannerRightClassName={styles.PointsHistoryBannerRight}
        historyBannerImage={
          <ObjectFitImage noCompression src={RewardsPointsHistoryBannerImage} alt="Beep Cashback History Banner" />
        }
        onClickInfoButton={handleClickHowToUseButton}
        infoButtonTestId="rewards.business.points-history.how-to-use-button"
      />
      <section className={styles.PointsHistorySection}>
        <h2 className={styles.PointsHistoryListTitle}>{t('PointsHistory')}</h2>
        <HistoryList
          isEmpty={isPointsHistoryListEmpty}
          emptyTitle={t('NoPointsCollectedTitle')}
          emptyDescription={t('NoPointsCollectedDescription', {
            emptyPromptEarnPointsNumber,
            emptyPromptBaseSpent,
          })}
          historyList={pointsHistoryList}
        />
      </section>
      <EarnedPointsPromptDrawer />
    </Frame>
  );
};

PointsHistory.displayName = 'PointsHistory';

export default PointsHistory;
