import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RewardsPointsIcon from '../../../../../images/rewards-icon-points.svg';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { getClassName } from '../../../../../common/utils/ui';
import CleverTap from '../../../../../utils/clevertap';
import { getLocationSearch } from '../../../../redux/modules/common/selectors';
import { getPointsRewardList } from '../../redux/common/selectors';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import Button from '../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../common/components/Image';
import Tag from '../../../../../common/components/Tag';
import Ticket from '../../components/Ticket';
import styles from './PointsRewardsPage.module.scss';

const PointsRewardsPage = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const history = useHistory();
  const search = useSelector(getLocationSearch);
  const pointsRewardList = useSelector(getPointsRewardList);
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
    </Frame>
  );
};

PointsRewardsPage.displayName = 'PointsRewardsPage';

export default PointsRewardsPage;
