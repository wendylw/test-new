import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLifecycles } from 'react-use';
import { useTranslation } from 'react-i18next';
import PointsRewardClaimedIcon from '../../../../../images/rewards-points-claimed.svg';
import { REWARDS_APPLIED_SOURCE_I18KEYS } from '../../utils/constants';
import CleverTap from '../../../../../utils/clevertap';
import {
  getPointsRewardFormatDiscountValue,
  getPointsRewardPromotionName,
  getPointsRewardPromotionType,
  getPointsRewardCostOfPoints,
  getPointsRewardValidPeriod,
  getPointsRewardMinSpendPrice,
  getPointsRewardFormatAppliedProductsText,
  getPointsRewardFormatAppliedStoresText,
  getPointsRewardRedeemOnlineList,
  getIsPointsRewardRedeemOnlineShow,
  getIsPointsRewardRedeemInStoreShow,
  getIsClaimPointsRewardFulfilled,
  getIsClaimPointsRewardPending,
  getClaimPointsRewardErrorI18nKeys,
  getIsProfileModalShow,
} from './redux/selectors';
import { actions as pointsRewardActions } from './redux';
import {
  backButtonClicked,
  mounted,
  claimPointsReward,
  pointsClaimRewardButtonClicked,
  hideWebProfileForm,
  viewRewardButtonClicked,
} from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageFooter from '../../../../../common/components/PageFooter';
import RewardDetailTicket from '../../components/RewardDetailTicket';
import Button from '../../../../../common/components/Button';
import PageToast from '../../../../../common/components/PageToast';
import { ObjectFitImage } from '../../../../../common/components/Image';
import Loader from '../../../../../common/components/Loader';
import { alert, confirm } from '../../../../../common/utils/feedback';
import CompleteProfile from '../../../CompleteProfile';
import styles from './PointsRewardDetail.module.scss';

const PointsRewardDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const formatDiscountValue = useSelector(getPointsRewardFormatDiscountValue);
  const name = useSelector(getPointsRewardPromotionName);
  const type = useSelector(getPointsRewardPromotionType);
  const costOfPoints = useSelector(getPointsRewardCostOfPoints);
  const pointsRewardValidPeriod = useSelector(getPointsRewardValidPeriod);
  const pointsRewardMinSpendPrice = useSelector(getPointsRewardMinSpendPrice);
  const formatAppliedProductsText = useSelector(getPointsRewardFormatAppliedProductsText);
  const formatAppliedStoresText = useSelector(getPointsRewardFormatAppliedStoresText);
  const redeemOnlineList = useSelector(getPointsRewardRedeemOnlineList);
  const isPointsRewardRedeemOnlineShow = useSelector(getIsPointsRewardRedeemOnlineShow);
  const isPointsRewardRedeemInStoreShow = useSelector(getIsPointsRewardRedeemInStoreShow);
  const isClaimPointsRewardFulfilled = useSelector(getIsClaimPointsRewardFulfilled);
  const isClaimPointsRewardPending = useSelector(getIsClaimPointsRewardPending);
  const claimPointsRewardErrorI18nKeys = useSelector(getClaimPointsRewardErrorI18nKeys);
  const isProfileModalShow = useSelector(getIsProfileModalShow);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickGetRewardButton = useCallback(() => {
    CleverTap.pushEvent('Points Reward Details Page - Click Get Reward Button');

    confirm('', {
      className: styles.PointsRewardConfirm,
      title: t('RewardsCostOfPointsConfirmMessage', { costOfPoints }),
      cancelButtonContent: t('Cancel'),
      confirmButtonContent: t('Confirm'),
      onSelection: async status => {
        dispatch(pointsClaimRewardButtonClicked({ status, type, costOfPoints }));
      },
    });
  }, [dispatch, t, type, costOfPoints]);
  const handleClickViewRewardButton = useCallback(
    status => {
      dispatch(viewRewardButtonClicked(status));
    },
    [dispatch]
  );
  const handleClickSkipProfileButton = useCallback(() => dispatch(hideWebProfileForm()), [dispatch]);
  const handleClickSaveProfileButton = useCallback(() => dispatch(claimPointsReward()), [dispatch]);
  const handleCloseCompleteProfile = useCallback(() => dispatch(hideWebProfileForm()), [dispatch]);

  useLifecycles(
    () => {
      dispatch(mounted());
    },
    () => {
      dispatch(pointsRewardActions.loadPointsRewardDetailRequestReset());
    }
  );

  useEffect(() => {
    if (isClaimPointsRewardFulfilled) {
      confirm(
        <div className={styles.PointsRewardDetailClaimedAlertContent}>
          <div className={styles.PointsRewardDetailClaimedAlertIcon}>
            <ObjectFitImage
              noCompression
              src={PointsRewardClaimedIcon}
              alt="Points Reward Claimed Successful Icon in StoreHub"
            />
          </div>
          <h4 className={styles.PointsRewardDetailClaimedAlertTitle}>{t('PointsRewardClaimedTitle')}</h4>
          <p className={styles.PointsRewardDetailClaimedAlertDescription}>{t('PointsRewardClaimedDescription')}</p>
        </div>,
        {
          customizeContent: true,
          cancelButtonContent: t('Back'),
          confirmButtonContent: t('ViewReward'),
          onSelection: handleClickViewRewardButton,
        }
      );
    }
  }, [t, isClaimPointsRewardFulfilled, handleClickViewRewardButton, dispatch]);

  useEffect(() => {
    if (claimPointsRewardErrorI18nKeys) {
      const { titleI18nKey, descriptionI18nKey } = claimPointsRewardErrorI18nKeys || {};

      alert(t(descriptionI18nKey), {
        title: t(titleI18nKey),
        onClose: () => {
          dispatch(pointsRewardActions.claimPointsRewardRequestReset());
        },
      });
    }
  }, [claimPointsRewardErrorI18nKeys, t, dispatch]);

  return (
    <>
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
      {isClaimPointsRewardPending && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
      <CompleteProfile
        show={isProfileModalShow}
        onSave={handleClickSaveProfileButton}
        onSkip={handleClickSkipProfileButton}
        onClose={handleCloseCompleteProfile}
      />
    </>
  );
};

PointsRewardDetail.displayName = 'PointsRewardDetail';

export default PointsRewardDetail;
