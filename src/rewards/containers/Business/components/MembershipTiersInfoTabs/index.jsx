import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getClassName } from '../../../../../common/utils/ui';
import {
  getIsMembershipBenefitTabsShown,
  getMerchantMembershipTiersBenefit,
} from '../../../../redux/modules/common/selectors';
import styles from './MembershipTiersInfoTabs.module.scss';

const MembershipTiersInfoTabs = () => {
  const isMembershipBenefitTabsShown = useSelector(getIsMembershipBenefitTabsShown);
  const membershipTiersBenefit = useSelector(getMerchantMembershipTiersBenefit);
  const [activeIndex, setActiveIndex] = useState(0);
  const handleClickMembershipTierButton = index => {
    setActiveIndex(index);
  };

  return (
    <section className={styles.MembershipTiersInfoTabsSection}>
      <h5 className={styles.MembershipTiersInfoTabsTitle}>Membership Benefits</h5>
      <div className={styles.MembershipTiersInfoTabsContainer}>
        {isMembershipBenefitTabsShown ? (
          <>
            <ul className={styles.MembershipTiersInfoTabs}>
              {membershipTiersBenefit.map((tier, index) => (
                <li key={`membership-tier-name-${tier.level}`} className={styles.MembershipTiersInfoTab}>
                  <button
                    className={styles.MembershipTiersInfoTabName}
                    data-test-id="rewards.business.membership-tiers-info-tabs.tier-button"
                    onClick={() => {
                      handleClickMembershipTierButton(index);
                    }}
                  >
                    {tier.name}
                  </button>
                </li>
              ))}
            </ul>
            {membershipTiersBenefit.map((benefit, index) => {
              const benefitDescriptionClassName = getClassName([
                styles.MembershipTiersInfoTabContent,
                activeIndex === index && styles.MembershipTiersInfoTabContent__active,
              ]);

              return (
                <div
                  key={`membership-tier-benefit-${benefit.level}`}
                  className={benefitDescriptionClassName}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: benefit.description }}
                  data-test-id="rewards.business.membership-tiers-info-tabs.benefit-description"
                />
              );
            })}
          </>
        ) : (
          'test'
        )}
      </div>
    </section>
  );
};

MembershipTiersInfoTabs.displayName = 'MembershipTiersInfoTabs';

export default MembershipTiersInfoTabs;
