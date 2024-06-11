import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import RewardsPointsIcon from '../../../../../../../images/rewards-icon-points.svg';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import { getPointsRewardList, getIsPointsRewardListShown } from '../../redux/selectors';
import Button from '../../../../../../../common/components/Button';
import Slider from '../../../../../../../common/components/Slider';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import Ticket from '../../../../components/Ticket';
import styles from './PointsRewards.module.scss';

const PointsRewards = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const pointsRewards = useSelector(getPointsRewardList);
  const isPointsRewardListShown = useSelector(getIsPointsRewardListShown);
  const search = useSelector(getLocationSearch);
  const handleClickViewAllButton = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.POINTS_REWARDS}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search]);

  if (!isPointsRewardListShown) {
    return null;
  }

  return (
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
        <Slider mode="free-snap" perView={1.36} spacing={15}>
          {pointsRewards.map(pointsReward => {
            const { id, name, costOfPoints, isUnavailable } = pointsReward;

            return (
              <Ticket
                key={id}
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
            );
          })}
        </Slider>
      </div>
    </section>
  );
};

PointsRewards.displayName = 'PointsRewards';

export default PointsRewards;
