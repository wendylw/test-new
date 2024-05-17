import React, { useEffect, useState, createRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Lock } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { MEMBER_LEVELS } from '../../../../../common/utils/constants';
import { getClassName } from '../../../../../common/utils/ui';
import { getCustomerTierLevel } from '../../../../redux/modules/customer/selectors';
import {
  getIsMembershipBenefitTabsShown,
  getMerchantMembershipTiersBenefit,
  getIsMembershipBenefitInfoShown,
  getMerchantMembershipTiersBenefitLength,
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

const MembershipTiersTabs = ({ unLockLevel }) => {
  const { t } = useTranslation(['Rewards']);
  const customerTierLevel = useSelector(getCustomerTierLevel);
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
    <section className={styles.MembershipTiersTabsSection}>
      <div className={styles.MembershipTiersTabsContainer}>
        {isMembershipBenefitTabsShown ? (
          <>
            <ul className={styles.MembershipTiersTabs}>
              {membershipTiersBenefit.map((tier, index) => {
                const membershipTiersBenefitButtonClassName = getClassName([
                  styles.MembershipTiersTabName,
                  activeIndex === index && styles.MembershipTiersTabName__active,
                ]);
                const isLocked = tier.level > (unLockLevel || customerTierLevel || MEMBER_LEVELS.MEMBER);

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
                      {isLocked && <Lock size={16} />}
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
            {membershipTiersBenefit.map((benefit, index) => {
              const benefitDescriptionClassName = getClassName([
                styles.MembershipTiersTabContent,
                styles.MembershipTiersTabContent__tab,
                activeIndex === index && styles.MembershipTiersTabContent__active,
              ]);
              let unlockLevelPrompt = null;

              if (unLockLevel && benefit.level === unLockLevel) {
                unlockLevelPrompt = t('UnlockLevelPrompt');
              }

              if (unLockLevel && benefit.level > unLockLevel) {
                unlockLevelPrompt = t('UnlockHigherLevelPrompt', { levelName: benefit.name });
              }

              return (
                <div key={`membership-tier-benefit-${benefit.level}`} className={benefitDescriptionClassName}>
                  {unlockLevelPrompt && <p className={styles.MembershipTiersTabContentPrompt}>{unlockLevelPrompt}</p>}
                  <div
                    style={{
                      margin: '16px auto',
                    }}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: benefit.description }}
                    data-test-id="rewards.business.membership-tiers-info-tabs.benefit-description"
                  />
                </div>
              );
            })}
          </>
        ) : (
          <>
            {unLockLevel && <p className={styles.MembershipTiersTabContentPrompt}>{t('UnlockLevelPrompt')}</p>}
            <div
              className={`${styles.MembershipTiersTabContent} ${styles.MembershipTiersTabContent__active}`}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: membershipTiersBenefit[0].description }}
              data-test-id="rewards.business.membership-tiers-info-tabs.benefit-description"
            />
          </>
        )}
      </div>
    </section>
  );
};

MembershipTiersTabs.displayName = 'MembershipTiersTabs';

MembershipTiersTabs.defaultProps = {
  unLockLevel: null,
};

MembershipTiersTabs.propTypes = {
  unLockLevel: PropTypes.oneOf(Object.values(MEMBER_LEVELS)),
};

export default MembershipTiersTabs;
