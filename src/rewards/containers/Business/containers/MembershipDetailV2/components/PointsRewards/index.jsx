import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useWindowSize } from 'react-use';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { CaretRight } from 'phosphor-react';
import RewardsPointsIcon from '../../../../../../../images/rewards-icon-points.svg';
import PointsRewardClaimedIcon from '../../../../../../../images/rewards-points-claimed.svg';
import { DESKTOP_PAGE_WIDTH, PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { POINTS_REWARD_WIDTHS } from '../../utils/constants';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getIsWebview, getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import {
  getPointsRewardList,
  getIsPointsRewardListShown,
  getIsClaimPointsRewardFulfilled,
  getClaimPointsRewardErrorI18nKeys,
  getIsProfileModalShow,
} from '../../redux/selectors';
import { actions as membershipDetailActions } from '../../redux';
import { pointsClaimRewardButtonClicked, skipProfileButtonClicked, saveProfileButtonClicked } from '../../redux/thunks';
import Button from '../../../../../../../common/components/Button';
import Slider from '../../../../../../../common/components/Slider';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import { alert, confirm } from '../../../../../../../common/utils/feedback';
import Ticket from '../../../../components/Ticket';
import Profile from '../../../../../Profile';
import styles from './PointsRewards.module.scss';

const getTicketWidth = windowWidth => {
  if (!windowWidth) {
    return POINTS_REWARD_WIDTHS.MIN_WIDTH;
  }

  // DESKTOP_PAGE_WIDTH is desktop page width
  const pageWidth = windowWidth > DESKTOP_PAGE_WIDTH ? DESKTOP_PAGE_WIDTH : windowWidth;
  // one ticket base on design is 2 / 3
  const ticketWidth = (pageWidth * (2 / 3)).toFixed(2);

  return ticketWidth > POINTS_REWARD_WIDTHS.MAX_WIDTH ? POINTS_REWARD_WIDTHS.MAX_WIDTH : ticketWidth;
};

const PointsRewards = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['Rewards']);
  const { width } = useWindowSize();
  const history = useHistory();
  const pointsRewards = useSelector(getPointsRewardList);
  const isPointsRewardListShown = useSelector(getIsPointsRewardListShown);
  const isClaimPointsRewardFulfilled = useSelector(getIsClaimPointsRewardFulfilled);
  const claimPointsRewardErrorI18nKeys = useSelector(getClaimPointsRewardErrorI18nKeys);
  const isWebview = useSelector(getIsWebview);
  const search = useSelector(getLocationSearch);
  const isProfileModalShow = useSelector(getIsProfileModalShow);
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const ticketWidth = useMemo(() => getTicketWidth(width));
  const handleClickViewAllButton = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.POINTS_REWARDS}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search]);
  const handlePointsClaimRewardButtonClick = (id, type, costOfPoints) => {
    confirm('', {
      className: styles.PointsRewardConfirm,
      title: t('RewardsCostOfPointsConfirmMessage', { costOfPoints }),
      cancelButtonContent: t('Cancel'),
      confirmButtonContent: t('Confirm'),
      onSelection: async status => {
        dispatch(pointsClaimRewardButtonClicked({ id, status, type, costOfPoints }));
      },
    });
  };
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
            dispatch(membershipDetailActions.claimPointsRewardRequestReset());
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
          dispatch(membershipDetailActions.claimPointsRewardRequestReset());
        },
      });
    }
  }, [claimPointsRewardErrorI18nKeys, t, dispatch]);

  if (!isPointsRewardListShown) {
    return null;
  }

  return (
    <>
      <section className={styles.PointsRewardsSection}>
        <div className={styles.PointsRewardsSectionTopContainer}>
          <h2 className={styles.PointsRewardsSectionTitle}>{t('GetRewards')}</h2>
          <Button
            type="text"
            size="small"
            theme="info"
            className={styles.PointsRewardsSectionViewAllButton}
            contentClassName={styles.PointsRewardsSectionViewAllButtonContent}
            data-test-id="rewards.membership-detail.get-rewards.view-all-button"
            onClick={handleClickViewAllButton}
          >
            {t('ViewAll')}
          </Button>
        </div>
        <div className={styles.PointsRewardsContentContainer}>
          <Slider
            mode="free-snap"
            perView="auto"
            spacing={15}
            slideStyle={{
              minWidth: `${ticketWidth}px`,
              maxWidth: `${ticketWidth}px`,
              width: `${ticketWidth}px`,
            }}
          >
            {pointsRewards.map(pointsReward => {
              const { id, type, name, costOfPoints, isUnavailable } = pointsReward;

              return (
                <Button
                  key={id}
                  type="text"
                  theme="ghost"
                  data-test-id="rewards.membership-detail.points-rewards.reward"
                  className={styles.PointsRewardsTicketButton}
                  contentClassName={styles.PointsRewardsTicketButtonContent}
                  onClick={() => {
                    setSelectedRewardId(id);
                    handlePointsClaimRewardButtonClick(id, type, costOfPoints);
                  }}
                >
                  <Ticket
                    className={styles.PointsRewardsTicket}
                    main={
                      <div className={styles.PointsRewardsTicketMain}>
                        <h3 className={styles.PointsRewardsTicketMainTitle}>{name}</h3>
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
                      </div>
                    }
                  />
                </Button>
              );
            })}
            <Button type="text" theme="ghost">
              <i className={styles.PointsRewardsMoreButtonIcon}>
                <CaretRight size={24} />
              </i>
              <span className={styles.PointsRewardsMoreButtonText}>{t('More')}</span>
            </Button>
          </Slider>
        </div>
      </section>
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
    </>
  );
};

PointsRewards.displayName = 'PointsRewards';

export default PointsRewards;
