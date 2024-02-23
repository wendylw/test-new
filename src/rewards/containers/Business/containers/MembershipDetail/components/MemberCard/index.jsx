import React, { Fragment, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Info } from 'phosphor-react';
import { getClassName } from '../../../../../../../common/utils/ui';
import { MemberIcon } from '../../../../../../../common/components/Icons';
import { MEMBERSHIP_LEVEL_I18N_KEYS } from '../../utils/constants';
import { getMerchantDisplayName } from '../../../../../../../redux/modules/merchant/selectors';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import {
  getMemberCardStyles,
  getMemberCardIconColors,
  getIsMemberCardMembershipProgressBarShow,
  getMemberCardTierProgressBarStyles,
  getMemberCardMembershipProgressTierList,
  getMemberCardMembershipLevelStatus,
  getMemberCardMembershipProgressMessageIn18nParams,
} from '../../redux/selectors';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const { t } = useTranslation('Rewards');
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const customerTierLevelName = useSelector(getCustomerTierLevelName);
  const memberCardStyles = useSelector(getMemberCardStyles);
  const memberCardIconColors = useSelector(getMemberCardIconColors);
  const isMemberCardMembershipProgressBarShow = useSelector(getIsMemberCardMembershipProgressBarShow);
  const memberCardTierProgressBarStyles = useSelector(getMemberCardTierProgressBarStyles);
  const memberCardMembershipProgressTierList = useSelector(getMemberCardMembershipProgressTierList);
  const memberCardMembershipLevelStatus = useSelector(getMemberCardMembershipLevelStatus);
  const memberCardMembershipLevelMessageIn18nParams = useSelector(getMemberCardMembershipProgressMessageIn18nParams);
  const memberLevelI18nKeys = MEMBERSHIP_LEVEL_I18N_KEYS[memberCardMembershipLevelStatus];
  const { messageI18nKey, messageI18nParamsKeys } = memberLevelI18nKeys || {};
  const { crownStartColor, crownEndColor, backgroundStartColor, backgroundEndColor } = memberCardIconColors;
  const [promptToolTipContainerClassNameList, setPromptToolTipContainerClassNameList] = useState([
    styles.MemberCardLevelProgressPromptToolTipContainer,
  ]);
  const handleClickMemberCardLevelProgressPromptToolTip = useCallback(() => {
    const toolTipShownClassName = styles.MemberCardLevelProgressPromptToolTipContainer__show;

    if (promptToolTipContainerClassNameList.includes(toolTipShownClassName)) {
      setPromptToolTipContainerClassNameList(
        promptToolTipContainerClassNameList.filter(item => item !== toolTipShownClassName)
      );
    } else {
      setPromptToolTipContainerClassNameList([...promptToolTipContainerClassNameList, toolTipShownClassName]);
    }
  });

  console.log(promptToolTipContainerClassNameList);

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard} style={memberCardStyles}>
        <h1 className={styles.MemberCardStoreName}>{merchantDisplayName}</h1>
        {isMemberCardMembershipProgressBarShow ? (
          <div className={styles.MemberCardLevelProgressContainer}>
            <span className={styles.MemberCardLevelName}>{customerTierLevelName}</span>
            <p className={styles.MemberCardLevelProgressPrompt}>
              {messageI18nParamsKeys
                ? t(messageI18nKey, memberCardMembershipLevelMessageIn18nParams)
                : t(messageI18nKey)}
              <button
                data-test-id="rewards.business.membership-detail.member-card.progress-info-tooltip-button"
                className={getClassName(promptToolTipContainerClassNameList)}
                onClick={handleClickMemberCardLevelProgressPromptToolTip}
              >
                <Info size={18} />
                <div className={styles.MemberCardLevelProgressPromptToolTip}>
                  <span className={styles.MemberCardLevelProgressPromptToolTipText}>{t('LevelUpdateRuleText')}</span>
                </div>
              </button>
            </p>
            <ul className={styles.MemberCardLevelProgress}>
              {memberCardMembershipProgressTierList.map((tier, index) => {
                const { level, name, iconColors, active, progress } = tier;
                const iconKey = `membership-level-progress-icon-${level}`;
                const progressBarKey = `membership-level-progress-bar-${level}`;
                const MemberIconElement = (
                  <MemberIcon
                    id={iconKey}
                    className={styles.MemberCardLevelProgressItemIcon}
                    style={
                      active
                        ? {
                            backgroundColor: memberCardTierProgressBarStyles.activeBackground,
                          }
                        : null
                    }
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
                      <li key={progressBarKey} className={styles.MemberCardLevelProgressItemProgress}>
                        <span
                          className={getClassName([
                            styles.MemberCardLevelProgressItemFill,
                            progress !== '100%' && styles.MemberCardLevelProgressItemFill__notAchieved,
                          ])}
                          style={{
                            width: progress,
                            backgroundColor: memberCardTierProgressBarStyles.progressBackground,
                          }}
                        />
                      </li>
                    )}
                    <li key={iconKey} className={styles.MemberCardLevelProgressItem}>
                      {MemberIconElement}
                      <span
                        className={styles.MemberCardLevelProgressItemLevelName}
                        style={{
                          color: memberCardTierProgressBarStyles.color,
                        }}
                      >
                        {name}
                      </span>
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
