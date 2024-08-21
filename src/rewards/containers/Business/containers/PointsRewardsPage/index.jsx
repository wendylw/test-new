import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import RewardsPointsIcon from '../../../../../images/rewards-icon-points.svg';
import PointsRewardClaimedIcon from '../../../../../images/rewards-points-claimed.svg';
import { getClassName } from '../../../../../common/utils/ui';
import CleverTap from '../../../../../utils/clevertap';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { getIsWebview } from '../../../../redux/modules/common/selectors';
import {
  getPointsRewardList,
  getIsClaimPointsRewardPending,
  getIsClaimPointsRewardFulfilled,
  getClaimPointsRewardErrorI18nKeys,
} from '../../redux/common/selectors';
import { actions as businessCommonActions } from '../../redux/common';
import { getIsProfileModalShow } from './redux/selectors';
import {
  backButtonClicked,
  mounted,
  pointsClaimRewardButtonClicked,
  skipProfileButtonClicked,
  saveProfileButtonClicked,
} from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import Button from '../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../common/components/Image';
import PageToast from '../../../../../common/components/PageToast';
import Loader from '../../../../../common/components/Loader';
import Tag from '../../../../../common/components/Tag';
import { alert, confirm } from '../../../../../common/utils/feedback';
import Ticket from '../../components/Ticket';
import Profile from '../../../Profile';
import styles from './PointsRewardsPage.module.scss';

const PointsRewardsPage = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWebview = useSelector(getIsWebview);
  const pointsRewardList = useSelector(getPointsRewardList);
  const isClaimPointsRewardPending = useSelector(getIsClaimPointsRewardPending);
  const isClaimPointsRewardFulfilled = useSelector(getIsClaimPointsRewardFulfilled);
  const isProfileModalShow = useSelector(getIsProfileModalShow);
  const claimPointsRewardErrorI18nKeys = useSelector(getClaimPointsRewardErrorI18nKeys);
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handlePointsClaimRewardButtonClick = useCallback(
    (id, type, costOfPoints) => {
      confirm('', {
        className: styles.PointsRewardConfirm,
        title: t('RewardsCostOfPointsConfirmMessage', { costOfPoints }),
        cancelButtonContent: t('Cancel'),
        confirmButtonContent: t('Confirm'),
        onSelection: async status => {
          dispatch(pointsClaimRewardButtonClicked({ id, status, type, costOfPoints }));
        },
      });
    },
    [dispatch, t]
  );
  const handleClickSkipProfileButton = useCallback(
    id => {
      dispatch(skipProfileButtonClicked(id));
      setSelectedRewardId(null);
    },
    [dispatch, setSelectedRewardId]
  );
  const handleClickSaveProfileButton = useCallback(
    id => {
      dispatch(saveProfileButtonClicked(id));
      setSelectedRewardId(null);
    },
    [dispatch, setSelectedRewardId]
  );

  useMount(() => {
    dispatch(mounted());
  });

  useEffect(() => {
    if (isClaimPointsRewardFulfilled) {
      alert(
        <div className={styles.PointsRewardsClaimedAlertContent}>
          <div className={styles.PointsRewardsClaimedAlertIcon}>
            <ObjectFitImage
              noCompression
              src={PointsRewardClaimedIcon}
              alt="Points Reward Claimed Successful Icon in StoreHub"
            />
          </div>
          <h4 className={styles.PointsRewardsClaimedAlertTitle}>{t('PointsRewardClaimedTitle')}</h4>
          <p className={styles.PointsRewardsClaimedAlertDescription}>{t('PointsRewardClaimedDescription')}</p>
        </div>,
        {
          onClose: () => {
            dispatch(businessCommonActions.claimPointsRewardRequestReset());
          },
        }
      );
    }
  }, [t, isClaimPointsRewardFulfilled, dispatch]);

  useEffect(() => {
    if (claimPointsRewardErrorI18nKeys) {
      const { titleI18nKey, descriptionI18nKey } = claimPointsRewardErrorI18nKeys || {};

      alert(t(descriptionI18nKey), {
        title: t(titleI18nKey),
        onClose: () => {
          dispatch(businessCommonActions.claimPointsRewardRequestReset());
        },
      });
    }
  }, [claimPointsRewardErrorI18nKeys, t, dispatch]);

  return (
    <Frame>
      <PageHeader
        className={styles.PointsRewardsPageHeader}
        title={t('GetRewards')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <section className={styles.PointsRewardsSection}>
        <ul className={styles.PointsRewards}>
          {pointsRewardList.map(pointsReward => {
            const { id, type, name, isSoldOut, isExpired, costOfPoints, isUnavailable } = pointsReward;

            return (
              <li>
                <Button
                  key={id}
                  type="text"
                  theme="ghost"
                  data-test-id="rewards.membership-detail.points-rewards.reward"
                  className={styles.PointsRewardsTicketButton}
                  contentClassName={styles.PointsRewardsTicketButtonContent}
                  onClick={() => {
                    CleverTap.pushEvent('Membership Details Page - Click Points Reward', {
                      'account name': merchantBusiness,
                    });

                    if (!isUnavailable) {
                      setSelectedRewardId(id);
                      handlePointsClaimRewardButtonClick(id, type, costOfPoints);
                    }
                  }}
                >
                  <Ticket
                    className={styles.PointsRewardsTicket}
                    main={
                      <div className={styles.PointsRewardsTicketMain}>
                        <h3 className={styles.PointsRewardsTicketMainTitle}>{name}</h3>
                        <div className={styles.PointsRewardsTicketMainContent}>
                          <data
                            value={costOfPoints}
                            className={getClassName([
                              styles.PointsRewardsClaimedPointsContainer,
                              isUnavailable ? styles.PointsRewardsClaimedPointsContainer__unavailable : null,
                            ])}
                          >
                            <div className={styles.PointsRewardsPointsIconContainer}>
                              <ObjectFitImage noCompression src={RewardsPointsIcon} />
                            </div>
                            {t('RewardsCostOfPointsText', { costOfPoints })}
                          </data>

                          {isSoldOut || isExpired ? (
                            <Tag className={styles.PointsRewardsTicketMainStatusTag}>
                              {isExpired ? t('Expired') : t('SoldOut')}
                            </Tag>
                          ) : null}
                        </div>
                      </div>
                    }
                  />
                </Button>
              </li>
            );
          })}
        </ul>
      </section>
      {isClaimPointsRewardPending && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
      {!isWebview && (
        <Profile
          show={isProfileModalShow}
          onSave={() => {
            handleClickSaveProfileButton(selectedRewardId);
          }}
          onSkip={() => {
            handleClickSkipProfileButton(selectedRewardId);
          }}
        />
      )}
    </Frame>
  );
};

PointsRewardsPage.displayName = 'PointsRewardsPage';

export default PointsRewardsPage;
