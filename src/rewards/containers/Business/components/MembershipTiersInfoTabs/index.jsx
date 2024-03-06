import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getClassName } from '../../../../../common/utils/ui';
import {
  getIsMembershipBenefitTabsShown,
  getMerchantMembershipTiersBenefit,
} from '../../../../redux/modules/common/selectors';
import styles from './MembershipTiersInfoTabs.module.scss';

const getCurrentActiveBlockInfo = activeIndex => {
  const buttonElement = document.getElementById(`membership-tier-button-${activeIndex}`);

  if (buttonElement) {
    return {
      offsetLeft: buttonElement.offsetLeft,
      width: buttonElement.offsetWidth,
    };
  }

  return null;
};

const MembershipTiersInfoTabs = () => {
  const isMembershipBenefitTabsShown = useSelector(getIsMembershipBenefitTabsShown);
  const membershipTiersBenefit = useSelector(getMerchantMembershipTiersBenefit);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeBlockInfo, setActiveBlockInfo] = useState({
    offsetLeft: 0,
    width: 0,
  });
  const handleClickMembershipTierButton = index => {
    setActiveIndex(index);
    const activeInfo = getCurrentActiveBlockInfo(index);

    if (activeInfo) {
      setActiveBlockInfo({
        offsetLeft: activeInfo.offsetLeft,
        width: activeInfo.width,
      });
    }
  };

  return (
    <section className={styles.MembershipTiersInfoTabsSection}>
      <h5 className={styles.MembershipTiersInfoTabsTitle}>Membership Benefits</h5>
      <div className={styles.MembershipTiersInfoTabsContainer}>
        {isMembershipBenefitTabsShown ? (
          <>
            <ul className={styles.MembershipTiersInfoTabs}>
              {membershipTiersBenefit.map((tier, index) => {
                const membershipTiersBenefitButtonClassName = getClassName([
                  styles.MembershipTiersInfoTabName,
                  activeIndex === index && styles.MembershipTiersInfoTabName__active,
                ]);

                return (
                  <li key={`membership-tier-name-${tier.level}`} className={styles.MembershipTiersInfoTab}>
                    <button
                      id={`membership-tier-button-${index}`}
                      className={membershipTiersBenefitButtonClassName}
                      data-test-id="rewards.business.membership-tiers-info-tabs.tier-button"
                      onClick={() => {
                        handleClickMembershipTierButton(index);
                      }}
                    >
                      {tier.name}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div
              className={styles.MembershipTiersInfoTabsActiveBlock}
              style={{
                left: `${activeBlockInfo.offsetLeft}px`,
                width: `${activeBlockInfo.width}px`,
                transition: 'left 0.3s, width 0.3s',
              }}
            />
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
        ) : membershipTiersBenefit[0] ? (
          <div
            className={styles.MembershipTiersInfoTabContent__active}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: membershipTiersBenefit[0].description }}
            data-test-id="rewards.business.membership-tiers-info-tabs.benefit-description"
          />
        ) : null}
      </div>
    </section>
  );
};

MembershipTiersInfoTabs.displayName = 'MembershipTiersInfoTabs';

export default MembershipTiersInfoTabs;
