import React from 'react';
import { useSelector } from 'react-redux';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import {
  getMemberCardStyles,
  getMerchantMembershipTierList,
  getCustomerMemberLevelProgressStyles,
} from '../../redux/selectors';
import MemberIcon from '../../../../components/MemberIcon';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const customerTierLevelName = useSelector(getCustomerTierLevelName);
  const memberCardStyles = useSelector(getMemberCardStyles);
  const merchantMembershipTierList = useSelector(getMerchantMembershipTierList);
  const customerMemberLevelProgressStyles = useSelector(getCustomerMemberLevelProgressStyles);

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard} style={memberCardStyles}>
        <h2 className={styles.MemberCardCustomerTierLevelName}>{customerTierLevelName}</h2>
        <div className={styles.MemberCardLevelsProgress}>
          {customerMemberLevelProgressStyles && (
            <div role="progressbar" className={styles.MemberCardProgress}>
              <div className={styles.MemberCardProgressBar} style={customerMemberLevelProgressStyles} />
            </div>
          )}

          <ul className={styles.MemberCardLevels}>
            {merchantMembershipTierList.map(merchantMembershipTier => {
              const { level, iconColorPalettes } = merchantMembershipTier;

              return (
                <li key={`member-card-level-${level}`}>
                  <MemberIcon
                    className={styles.MemberCardLevelIcon}
                    id={`member-level-icon-${level}`}
                    crownStartColor={iconColorPalettes.crown.startColor}
                    crownEndColor={iconColorPalettes.crown.endColor}
                    backgroundStartColor={iconColorPalettes.background.startColor}
                    backgroundEndColor={iconColorPalettes.background.endColor}
                    strokeColor={iconColorPalettes.strokeColor}
                  />
                </li>
              );
            })}
          </ul>
        </div>
        {/* <div>
          <progress />
          <ul>
            {membershipTierList.map(membershipTier => {
              return <li></li>;
            })}
          </ul> */}
        {/* </div> */}
      </div>
    </section>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
