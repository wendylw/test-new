import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getPointsRewardList } from '../../redux/selectors';
import styles from './PointsRewardList.module.scss';

const PointsRewardList = () => {
  const { t } = useTranslation(['Rewards']);
  const uniquePromoList = useSelector(getPointsRewardList);

  if (uniquePromoList.length <= 0) {
    return null;
  }

  return (
    <section className={styles.PointsRewardListSection}>
      <h2 className={styles.PointsRewardListSectionTitle}>{t('GetRewards')}</h2>
      <ul className={styles.PointsRewardList}>
        {uniquePromoList.map(uniquePromo => {
          const uniquePromoInfoTopClassList = getClassName([
            styles.PointsRewardInfoTop,
            isUnavailable ? styles.PointsRewardInfoTop__Unavailable : null,
          ]);
          const uniquePromoInfoBottomClassList = [styles.PointsRewardInfoBottom];
          const uniquePromoLimitationListClassList = [styles.PointsRewardLimitationList];
          const { id, value, name, isUnavailable } = uniquePromo;

          if (isUnavailable) {
            uniquePromoInfoTopClassList.push(styles.PointsRewardInfoTop__Unavailable);
            uniquePromoInfoBottomClassList.push(styles.PointsRewardInfoBottom__Unavailable);
            uniquePromoLimitationListClassList.push(styles.PointsRewardLimitationList__Unavailable);
          }

          return (
            <li className={styles.PointsRewardCard} key={id}>
              <div className={getClassName(uniquePromoInfoTopClassList)}>
                <data className={styles.PointsRewardDiscount} value={value}>
                  {t('DiscountValueText', { discount: value })}
                </data>
                <h5 className={styles.PointsRewardDiscountName}>{name}</h5>
              </div>
              <div className={getClassName(uniquePromoInfoBottomClassList)}>button</div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

PointsRewardList.displayName = 'PointsRewardList';

export default PointsRewardList;
