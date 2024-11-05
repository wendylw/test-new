import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RewardsPointsIcon from '../../../../../images/rewards-icon-points.svg';
import PointsRewardClaimedIcon from '../../../../../images/rewards-points-claimed.svg';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { getClassName } from '../../../../../common/utils/ui';
import CleverTap from '../../../../../utils/clevertap';
import { getLocationSearch } from '../../../../redux/modules/common/selectors';
import {
  getPointsRewardList,
  getIsClaimPointsRewardPending,
  getIsClaimPointsRewardFulfilled,
  getClaimPointsRewardErrorI18nKeys,
} from '../../redux/common/selectors';
import { actions as businessCommonActions } from '../../redux/common';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import Button from '../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../common/components/Image';
import PageToast from '../../../../../common/components/PageToast';
import Loader from '../../../../../common/components/Loader';
import Tag from '../../../../../common/components/Tag';
import { alert } from '../../../../../common/utils/feedback';
import Ticket from '../../components/Ticket';
import styles from './PointsRewardsPage.module.scss';

const PointsRewardsPage = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const history = useHistory();
  const search = useSelector(getLocationSearch);
  const pointsRewardList = useSelector(getPointsRewardList);
  const isClaimPointsRewardPending = useSelector(getIsClaimPointsRewardPending);
  const isClaimPointsRewardFulfilled = useSelector(getIsClaimPointsRewardFulfilled);
  const claimPointsRewardErrorI18nKeys = useSelector(getClaimPointsRewardErrorI18nKeys);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickRewardItem = useCallback(
    rewardSettingId => {
      const pointsRewardDetail = {
        pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.POINTS_REWARDS}${PATH_NAME_MAPPING.DETAIL}`,
        search: `${search || '?'}&rewardSettingId=${rewardSettingId}`,
      };

      CleverTap.pushEvent('Points Rewards List Page - Click Points Reward');

      history.push(pointsRewardDetail);
    },
    [history, search]
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
            const { id, name, rewardSettingId, isSoldOut, isExpired, costOfPoints, isUnavailable } = pointsReward;

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
                    handleClickRewardItem(rewardSettingId);
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
    </Frame>
  );
};

PointsRewardsPage.displayName = 'PointsRewardsPage';

export default PointsRewardsPage;
