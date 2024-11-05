import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { REWARDS_APPLIED_SOURCE_I18KEYS } from '../../utils/constants';
import {
  getPointsRewardFormatDiscountValue,
  getPointsRewardPromotionName,
  getPointsRewardCostOfPoints,
  getPointsRewardValidPeriod,
  getPointsRewardMinSpendPrice,
  getPointsRewardFormatAppliedProductsText,
  getPointsRewardFormatAppliedStoresText,
  getPointsRewardRedeemOnlineList,
  getIsPointsRewardRedeemOnlineShow,
  getIsPointsRewardRedeemInStoreShow,
} from './redux/selectors';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageFooter from '../../../../../common/components/PageFooter';
import RewardDetailTicket from '../../components/RewardDetailTicket';
import Button from '../../../../../common/components/Button';
import styles from './PointsRewardDetail.module.scss';

const PointsRewardDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const formatDiscountValue = useSelector(getPointsRewardFormatDiscountValue);
  const name = useSelector(getPointsRewardPromotionName);
  const costOfPoints = useSelector(getPointsRewardCostOfPoints);
  const pointsRewardValidPeriod = useSelector(getPointsRewardValidPeriod);
  const pointsRewardMinSpendPrice = useSelector(getPointsRewardMinSpendPrice);
  const formatAppliedProductsText = useSelector(getPointsRewardFormatAppliedProductsText);
  const formatAppliedStoresText = useSelector(getPointsRewardFormatAppliedStoresText);
  const redeemOnlineList = useSelector(getPointsRewardRedeemOnlineList);
  const isPointsRewardRedeemOnlineShow = useSelector(getIsPointsRewardRedeemOnlineShow);
  const isPointsRewardRedeemInStoreShow = useSelector(getIsPointsRewardRedeemInStoreShow);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickGetRewardButton = useCallback(() => {}, []);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('PointsRewardDetails')} onBackArrowClick={handleClickHeaderBackButton} />

      <RewardDetailTicket
        discount={formatDiscountValue}
        discountText={t('DiscountValueText', { discount: formatDiscountValue })}
        name={name}
        stubClassName={styles.PointsRewardDetailTicketCostPointsContainer}
        stub={
          <data className={styles.PointsRewardDetailTicketCostPoints} value={costOfPoints}>
            {t('RewardsCostOfPointsText', { costOfPoints })}
          </data>
        }
      />

      <section className={styles.PointsRewardDetailApplicableProducts}>
        <h3 className={styles.PointsRewardDetailConditionTitle}>{t('PointsRewardValidityTitle')}</h3>
        {pointsRewardValidPeriod ? (
          <data className={styles.PointsRewardDetailConditionContent} value={pointsRewardValidPeriod}>
            {t('PointsRewardValidityText', { count: pointsRewardValidPeriod })}
          </data>
        ) : null}
      </section>

      <section className={styles.PointsRewardDetailApplicableProducts}>
        <h3 className={styles.PointsRewardDetailConditionTitle}>{t('PointsRewardMinSpendTitle')}</h3>
        {pointsRewardMinSpendPrice ? (
          <data className={styles.PointsRewardDetailConditionContent} value={pointsRewardMinSpendPrice}>
            {pointsRewardMinSpendPrice}
          </data>
        ) : null}
      </section>

      <section className={styles.PointsRewardDetailApplicableProducts}>
        <h3 className={styles.PointsRewardDetailConditionTitle}>{t('PointsRewardApplicableProductsTitle')}</h3>
        {formatAppliedProductsText && (
          <p className={styles.PointsRewardDetailConditionContent}>{formatAppliedProductsText}</p>
        )}
      </section>

      <section className={styles.PointsRewardDetailApplicableStores}>
        <h3 className={styles.PointsRewardDetailConditionTitle}>{t('PointsRewardApplicableStoresTitle')}</h3>
        {formatAppliedStoresText && (
          <p className={styles.PointsRewardDetailConditionContent}>{formatAppliedStoresText}</p>
        )}
      </section>

      <section className={styles.PointsRewardDetailHowToUse}>
        <h3 className={styles.PointsRewardDetailHowToUseTitle}>{t('HowToUse')}</h3>

        {isPointsRewardRedeemOnlineShow && (
          <div>
            <h4 className={styles.PointsRewardDetailHowToUseSubtitle}>{t('PointsRewardRedeemOnlineTitle')}</h4>
            <p className={styles.PointsRewardDetailHowToUseContentDescription}>
              {t('PointsRewardRedeemOnlineDescription')}
            </p>
            <ul className={styles.PointsRewardDetailHowToUseRedeemOnlineList}>
              {redeemOnlineList.map(redeemOnlineChannel => (
                <li
                  key={`myRewardDetail-redeemOnlineChannel-${redeemOnlineChannel}`}
                  className={styles.PointsRewardDetailHowToUseRedeemOnlineItem}
                >
                  {t(REWARDS_APPLIED_SOURCE_I18KEYS[redeemOnlineChannel])}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isPointsRewardRedeemInStoreShow && (
          <div>
            <h4 className={styles.PointsRewardDetailHowToUseSubtitle}>{t('PointsRewardRedeemInStoreTitle')}</h4>
            <p className={styles.PointsRewardDetailHowToUseContentDescription}>
              {t('PointsRewardRedeemInStoreDescription')}
            </p>
          </div>
        )}
      </section>

      <PageFooter zIndex={50}>
        <div className={styles.PointsRewardDetailFooterContent}>
          <Button
            className={styles.PointsRewardDetailFooterButton}
            block
            disabled={false}
            data-test-id="rewards.business.points-reward-detail.get-reward-button"
            onClick={handleClickGetRewardButton}
          >
            {t('GetReward')}
          </Button>
        </div>
      </PageFooter>
    </Frame>
  );
};

PointsRewardDetail.displayName = 'PointsRewardDetail';

export default PointsRewardDetail;
