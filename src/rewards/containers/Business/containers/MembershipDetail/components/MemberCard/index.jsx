import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { getClassName } from '../../../../../../../common/utils/ui';
import { MemberIcon } from '../../../../../../../common/components/Icons';
import { getMerchantDisplayName } from '../../../../../../../redux/modules/merchant/selectors';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import {
  getMemberCardStyles,
  getMemberCardIconColors,
  getIsCustomerMembershipTierListShow,
  getIsAchievedPlatinumLevel,
  getCustomerMembershipTierList,
} from '../../redux/selectors';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const customerTierLevelName = useSelector(getCustomerTierLevelName);
  const memberCardStyles = useSelector(getMemberCardStyles);
  const memberCardIconColors = useSelector(getMemberCardIconColors);
  const isCustomerMembershipTierListShow = useSelector(getIsCustomerMembershipTierListShow);
  const isAchievedPlatinumLevel = useSelector(getIsAchievedPlatinumLevel);
  const customerMembershipTierList = useSelector(getCustomerMembershipTierList);
  const { crownStartColor, crownEndColor, backgroundStartColor, backgroundEndColor } = memberCardIconColors;

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard} style={memberCardStyles}>
        <h1 className={styles.MemberCardStoreName}>{merchantDisplayName}</h1>
        {isCustomerMembershipTierListShow ? (
          <div className={styles.MemberCardLevelProgressContainer}>
            <span className={styles.MemberCardLevelName}>{customerTierLevelName}</span>
            <p>TODO: prompt will be replaced</p>
            <ul className={styles.MemberCardMembershipTierProgress}>
              {customerMembershipTierList.map((tier, index) => {
                const { level, iconColors, active, progress } = tier;
                const iconKey = `membership-level-progress-icon-${level}`;
                const progressBarKey = `membership-level-progress-bar-${level}`;
                const memberIconClassName = getClassName([
                  styles.MemberCardTierLevelItemIcon,
                  active && styles.MemberCardTierLevelItemIcon__active,
                  isAchievedPlatinumLevel && styles.MemberCardTierLevelItemIconPlatinum,
                ]);
                const memberCardLevelProgressFillClassName = getClassName([
                  styles.MemberCardTierItemLevelProgressFill,
                  progress !== '100%' && styles.MemberCardTierItemLevelProgressFill__notAchieved,
                  isAchievedPlatinumLevel && styles.MemberCardTierItemLevelProgressFillPlatinum,
                ]);
                const MemberIconElement = (
                  <MemberIcon
                    id={iconKey}
                    className={memberIconClassName}
                    crownStartColor={iconColors.crownStartColor}
                    crownEndColor={iconColors.crownEndColor}
                    backgroundStartColor={iconColors.backgroundStartColor}
                    backgroundEndColor={iconColors.backgroundEndColor}
                  />
                );

                // Not Fragment, console will show a warning: Each child in a list should have a unique "key" prop.
                return (
                  <Fragment key={`membership-level-progress-item-${level}`}>
                    {index > 0 && (
                      <li key={progressBarKey} className={styles.MemberCardTierLevelItemProgress}>
                        <span className={memberCardLevelProgressFillClassName} style={{ width: progress }} />
                      </li>
                    )}
                    <li key={iconKey} className={styles.MemberCardTierLevelItem}>
                      {MemberIconElement}
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className={styles.MemberCardLevelContainer}>
            <span className={styles.MemberCardLevelName}>{customerTierLevelName}</span>
            <MemberIcon
              className={styles.MemberCardLevelIcon}
              crownStartColor={crownStartColor}
              crownEndColor={crownEndColor}
              backgroundStartColor={backgroundStartColor}
              backgroundEndColor={backgroundEndColor}
            />
          </div>
        )}
      </div>
    </section>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
