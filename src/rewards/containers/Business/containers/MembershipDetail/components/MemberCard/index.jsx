import React from 'react';
import { useSelector } from 'react-redux';
import { MemberIcon } from '../../../../../../../common/components/Icons';
import { getMerchantDisplayName } from '../../../../../../../redux/modules/merchant/selectors';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import {
  getMemberCardStyles,
  getMemberCardIconColors,
  getIsHigherThanMemberLowestLevel,
  getCustomerMembershipTierList,
} from '../../redux/selectors';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const customerTierLevelName = useSelector(getCustomerTierLevelName);
  const memberCardStyles = useSelector(getMemberCardStyles);
  const memberCardIconColors = useSelector(getMemberCardIconColors);
  const isHigherThanMemberLowestLevel = useSelector(getIsHigherThanMemberLowestLevel);
  const customerMembershipTierList = useSelector(getCustomerMembershipTierList);
  const { crownStartColor, crownEndColor, backgroundStartColor, backgroundEndColor } = memberCardIconColors;

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard} style={memberCardStyles}>
        <h1 className={styles.MemberCardStoreName}>{merchantDisplayName}</h1>
        {isHigherThanMemberLowestLevel ? (
          <div>
            <span className={styles.MemberCardLevelName}>{customerTierLevelName}</span>
            <p>TODO: prompt will be replaced</p>
            {customerMembershipTierList.map(tier, index => {
              const { level, name, spendingThreshold, iconColors } = tier;
              const MemberIconElement = (
                <MemberIcon
                  className={styles.MemberCardTierItemLevelIcon}
                  crownStartColor={iconColors.crownStartColor}
                  crownEndColor={iconColors.crownEndColor}
                  backgroundStartColor={iconColors.backgroundStartColor}
                  backgroundEndColor={iconColors.backgroundEndColor}
                />
              );

              return (
                <ul>
                  {index > 0 ? (
                    <>
                      <li>test</li>
                      <li>{MemberIconElement}</li>
                    </>
                  ) : (
                    <li>MemberIconElement</li>
                  )}
                </ul>
              );
            })}
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
