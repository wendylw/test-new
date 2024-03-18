import React, { useEffect, useState, createRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getClassName } from '../../../../../common/utils/ui';
import {
  getIsMembershipBenefitTabsShown,
  getMerchantMembershipTiersBenefit,
  getIsMembershipBenefitInfoShown,
  getMerchantMembershipTiersBenefitLength,
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
  const { t } = useTranslation(['Rewards']);
  const isMembershipBenefitTabsShown = useSelector(getIsMembershipBenefitTabsShown);
  const membershipTiersBenefit = useSelector(getMerchantMembershipTiersBenefit);
  const isMembershipBenefitInfoShown = useSelector(getIsMembershipBenefitInfoShown);
  const benefitLength = useSelector(getMerchantMembershipTiersBenefitLength);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeBlockInfo, setActiveBlockInfo] = useState(null);
  const [elRefs, setElRefs] = useState([]);
  const handleClickMembershipTierButton = index => {
    setActiveIndex(index);
    setActiveBlockInfo(getCurrentActiveBlockInfo(index));
  };

  useEffect(() => {
    setElRefs(item =>
      Array(benefitLength)
        .fill()
        .map((_, i) => item[i] || createRef())
    );
  }, [benefitLength]);

  useEffect(() => {
    if (benefitLength && elRefs[0] && !activeBlockInfo) {
      setActiveBlockInfo(getCurrentActiveBlockInfo(0));
    }
  }, [benefitLength, elRefs, activeBlockInfo]);

  if (!isMembershipBenefitInfoShown) {
    return null;
  }

  return (
    <section className={styles.MembershipTiersInfoTabsSection}>
      <h5 className={styles.MembershipTiersInfoTabsTitle}>{t('MembershipBenefits')}</h5>
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
                      ref={elRefs[index]}
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
                left: `${activeBlockInfo?.offsetLeft}px`,
                width: `${activeBlockInfo?.width}px`,
                transition: 'left 0.3s, width 0.3s',
              }}
            />
            {membershipTiersBenefit.map((benefit, index) => {
              const benefitDescriptionClassName = getClassName([
                styles.MembershipTiersInfoTabContent,
                styles.MembershipTiersInfoTabContent__tab,
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
          <div
            className={`${styles.MembershipTiersInfoTabContent} ${styles.MembershipTiersInfoTabContent__active}`}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: membershipTiersBenefit[0].description }}
            data-test-id="rewards.business.membership-tiers-info-tabs.benefit-description"
          />
        )}
      </div>
    </section>
  );
};

MembershipTiersInfoTabs.displayName = 'MembershipTiersInfoTabs';

export default MembershipTiersInfoTabs;
