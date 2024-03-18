import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getPointsRewardList, getIsPointsRewardListShown } from '../../redux/selectors';
import { pointsClaimRewardButtonClick } from '../../redux/thunks';
import Button from '../../../../../../../common/components/Button';
import styles from './PointsRewardList.module.scss';

const PointsRewardList = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['Rewards']);
  const pointsRewardList = useSelector(getPointsRewardList);
  const isPointsRewardListShown = useSelector(getIsPointsRewardListShown);
  const handlePointsClaimRewardButtonClick = (id, type) => {
    dispatch(pointsClaimRewardButtonClick({ id, type }));
  };

  if (!isPointsRewardListShown) {
    return null;
  }

  return (
    <section className={styles.PointsRewardListSection}>
      <h2 className={styles.PointsRewardListSectionTitle}>{t('GetRewards')}</h2>
      <ul className={styles.PointsRewardList}>
        {pointsRewardList.map(pointsReward => {
          const { id, type, value, name, costOfPoints, isUnavailable } = pointsReward;
          const pointsRewardInfoLeftClassName = getClassName([
            styles.PointsRewardInfoLeft,
            isUnavailable ? styles.PointsRewardInfoLeft__Unavailable : null,
          ]);
          const pointsRewardInfoRightClassName = getClassName([
            styles.PointsRewardInfoRight,
            isUnavailable ? styles.PointsRewardInfoRight__Unavailable : null,
          ]);

          return (
            <li className={styles.PointsRewardCard} key={id}>
              <div className={pointsRewardInfoLeftClassName}>
                <data className={styles.PointsRewardDiscount} value={value}>
                  {t('DiscountValueText', { discount: value })}
                </data>
                <h5 className={styles.PointsRewardDiscountName}>{name}</h5>
              </div>
              <div className={pointsRewardInfoRightClassName}>
                <Button
                  data-test-id="rewards.membership-detail.points-claim-reward-button"
                  theme="ghost"
                  type="secondary"
                  size="small"
                  className={styles.PointsRewardConstButton}
                  contentClassName={styles.PointsRewardConstButtonContent}
                  disabled={isUnavailable}
                  onClick={() => {
                    handlePointsClaimRewardButtonClick(id, type);
                  }}
                >
                  {t('RewardsCostOfPointsText', { costOfPoints })}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

PointsRewardList.displayName = 'PointsRewardList';

export default PointsRewardList;
