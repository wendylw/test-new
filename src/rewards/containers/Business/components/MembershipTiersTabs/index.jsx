import React, { useEffect, useState, createRef } from 'react';
import { useSelector } from 'react-redux';
import { Lock, CheckCircle } from 'phosphor-react';
import { getClassName } from '../../../../../common/utils/ui';
import {
  getIsMembershipBenefitTabsShown,
  getMerchantMembershipTiersBenefits,
  getIsMembershipBenefitsShown,
  getMerchantMembershipTiersBenefitsLength,
} from '../../../../redux/modules/common/selectors';
import styles from './MembershipTiersTabs.module.scss';

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

const MembershipTiersTabs = () => {
  const isMembershipBenefitTabsShown = useSelector(getIsMembershipBenefitTabsShown);
  const merchantMembershipTiersBenefits = useSelector(getMerchantMembershipTiersBenefits);
  const isMembershipBenefitsShown = useSelector(getIsMembershipBenefitsShown);
  const benefitsLength = useSelector(getMerchantMembershipTiersBenefitsLength);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeBlockInfo, setActiveBlockInfo] = useState(null);
  const [elRefs, setElRefs] = useState([]);
  const handleClickMembershipTierButton = index => {
    setActiveIndex(index);
    setActiveBlockInfo(getCurrentActiveBlockInfo(index));
  };

  useEffect(() => {
    setElRefs(item =>
      Array(benefitsLength)
        .fill()
        .map((_, i) => item[i] || createRef())
    );
  }, [benefitsLength]);

  useEffect(() => {
    if (benefitsLength && elRefs[0] && !activeBlockInfo) {
      setActiveBlockInfo(getCurrentActiveBlockInfo(0));
    }
  }, [benefitsLength, elRefs, activeBlockInfo]);

  if (!isMembershipBenefitsShown) {
    return null;
  }

  return (
    <section className={styles.MembershipTiersTabsSection}>
      <div className={styles.MembershipTiersTabsContainer}>
        {isMembershipBenefitTabsShown ? (
          <>
            <ul className={styles.MembershipTiersTabs}>
              {merchantMembershipTiersBenefits.map((tier, index) => {
                const membershipTiersBenefitButtonClassName = getClassName([
                  styles.MembershipTiersTabName,
                  activeIndex === index && styles.MembershipTiersTabName__active,
                ]);

                return (
                  <li key={`membership-tier-name-${tier.level}`} className={styles.MembershipTiersTab}>
                    <button
                      ref={elRefs[index]}
                      id={`membership-tier-button-${index}`}
                      className={membershipTiersBenefitButtonClassName}
                      data-test-id="rewards.business.membership-tiers-info-tabs.tier-button"
                      onClick={() => {
                        handleClickMembershipTierButton(index);
                      }}
                    >
                      {tier.isLocked && <Lock size={16} />}
                      {tier.name}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div
              className={styles.MembershipTiersTabsActiveBlock}
              style={{
                left: `${activeBlockInfo?.offsetLeft}px`,
                width: `${activeBlockInfo?.width}px`,
                transition: 'left 0.3s, width 0.3s',
              }}
            />
            {merchantMembershipTiersBenefits.map((benefit, index) => {
              const { prompt, description, isLocked, key } = benefit;
              const benefitDescriptionClassName = getClassName([
                styles.MembershipTiersTabContent,
                styles.MembershipTiersTabContent__tab,
                activeIndex === index && styles.MembershipTiersTabContent__active,
              ]);
              const benefitDescriptionItemClassName = getClassName([
                styles.MembershipTiersTabContentDescriptionItem,
                isLocked && styles.MembershipTiersTabContentDescriptionItem__locked,
              ]);

              return (
                <div key={key} className={benefitDescriptionClassName}>
                  {prompt && <p className={styles.MembershipTiersTabContentPrompt}>{prompt}</p>}
                  <ul className={styles.MembershipTiersTabContentDescription}>
                    {description.map((item, descriptionItemIndex) => (
                      <li
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${key}-item-${descriptionItemIndex}`}
                        className={benefitDescriptionItemClassName}
                      >
                        {isLocked ? (
                          <Lock size={20} />
                        ) : (
                          <CheckCircle
                            className={styles.MembershipTiersTabContentDescriptionItemCheckedIcon}
                            size={20}
                          />
                        )}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </>
        ) : (
          <div className={`${styles.MembershipTiersTabContent} ${styles.MembershipTiersTabContent__active}`}>
            {merchantMembershipTiersBenefits[0].prompt && (
              <p className={styles.MembershipTiersTabContentPrompt}>{merchantMembershipTiersBenefits[0].prompt}</p>
            )}
            <ul className={styles.MembershipTiersTabContentDescription}>
              {merchantMembershipTiersBenefits[0].description.map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={`${item.key}-item-${index}`} className={styles.MembershipTiersTabContentDescriptionItem}>
                  <CheckCircle className={styles.MembershipTiersTabContentDescriptionItemCheckedIcon} size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

MembershipTiersTabs.displayName = 'MembershipTiersTabs';

export default MembershipTiersTabs;
