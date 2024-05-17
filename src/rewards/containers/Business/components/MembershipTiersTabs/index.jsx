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

// If description change from Back End. We will remove it
const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#36A93F" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>`;
const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#717171" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"></path></svg>`;

// If description change from Back End. We will remove it
const insertSvgStringToItem = (description, startTag, svgString) => {
  const regex = new RegExp(`(${startTag})`, 'g');

  return description.replace(regex, `$1${svgString}`);
};

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

const MembershipTiersTabs = ({ unlockLevel }) => {
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
                const isLocked = tier.level > (unlockLevel || customerTierLevel || MEMBER_LEVELS.MEMBER);

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
              let descriptionWithIcon = benefit.description;

              if (unlockLevel && benefit.level === unlockLevel) {
                unlockLevelPrompt = t('UnlockLevelPrompt');
              }

              if (unlockLevel && benefit.level > unlockLevel) {
                unlockLevelPrompt = t('UnlockHigherLevelPrompt', { levelName: benefit.name });
              }

              if (
                (unlockLevel && benefit.level <= unlockLevel) ||
                (customerTierLevel && benefit.level <= customerTierLevel) ||
                benefit.level === MEMBER_LEVELS.MEMBER
              ) {
                descriptionWithIcon = insertSvgStringToItem(descriptionWithIcon, `<li>`, CHECK_SVG);
              }

              if (
                (unlockLevel && benefit.level > unlockLevel) ||
                (customerTierLevel && benefit.level > customerTierLevel) ||
                benefit.level > MEMBER_LEVELS.MEMBER
              ) {
                descriptionWithIcon = insertSvgStringToItem(descriptionWithIcon, `<li>`, LOCK_SVG);
              }

              return (
                <div key={`membership-tier-benefit-${benefit.level}`} className={benefitDescriptionClassName}>
                  {unlockLevelPrompt && <p className={styles.MembershipTiersTabContentPrompt}>{unlockLevelPrompt}</p>}
                  <div
                    className={styles.MembershipTiersTabContentDescription}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: descriptionWithIcon }}
                    data-test-id="rewards.business.membership-tiers-info-tabs.benefit-description"
                  />
                </div>
              );
            })}
          </>
        ) : (
          <div className={`${styles.MembershipTiersTabContent} ${styles.MembershipTiersTabContent__active}`}>
            {unlockLevel && <p className={styles.MembershipTiersTabContentPrompt}>{t('UnlockLevelPrompt')}</p>}
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: membershipTiersBenefit[0].description }}
              data-test-id="rewards.business.membership-tiers-info-tabs.benefit-description"
            />
          </div>
        )}
      </div>
    </section>
  );
};

MembershipTiersTabs.displayName = 'MembershipTiersTabs';

MembershipTiersTabs.defaultProps = {
  unlockLevel: null,
};

MembershipTiersTabs.propTypes = {
  unlockLevel: PropTypes.oneOf(Object.values(MEMBER_LEVELS)),
};

export default MembershipTiersTabs;
