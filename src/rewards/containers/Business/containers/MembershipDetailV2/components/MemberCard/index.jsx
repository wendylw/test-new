import _isEmpty from 'lodash/isEmpty';
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Info } from 'phosphor-react';
import { MEMBERSHIP_TIER_I18N_KEYS } from '../../utils/constants';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import {
  getMemberCardStyles,
  getMerchantMembershipTierList,
  getCustomerMemberTierProgressStyles,
  getCustomerMemberTierStatus,
  getCustomerCurrentStatusParams,
} from '../../redux/selectors';
import MemberIcon from '../../../../components/MemberIcon';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const { t } = useTranslation(['Rewards']);
  const customerTierLevelName = useSelector(getCustomerTierLevelName);
  const memberCardStyles = useSelector(getMemberCardStyles);
  const merchantMembershipTierList = useSelector(getMerchantMembershipTierList);
  const customerMemberTierProgressStyles = useSelector(getCustomerMemberTierProgressStyles);
  const customerMemberTierStatus = useSelector(getCustomerMemberTierStatus);
  const customerCurrentStatusParams = useSelector(getCustomerCurrentStatusParams);
  const { messageI18nKey } = MEMBERSHIP_TIER_I18N_KEYS[customerMemberTierStatus];
  const [promptToolTipContainerClassNameList, setPromptToolTipContainerClassNameList] = useState([
    styles.MemberCardTierProgressPromptToolTipContainer,
  ]);
  const handleClickCurrentMemberTierPromptToolTip = useCallback(() => {
    const toolTipShownClassName = styles.MemberCardTierProgressPromptToolTipContainer__show;

    if (promptToolTipContainerClassNameList.includes(toolTipShownClassName)) {
      setPromptToolTipContainerClassNameList(
        promptToolTipContainerClassNameList.filter(item => item !== toolTipShownClassName)
      );
    } else {
      setPromptToolTipContainerClassNameList([...promptToolTipContainerClassNameList, toolTipShownClassName]);
    }
  }, [promptToolTipContainerClassNameList]);

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard} style={memberCardStyles}>
        <h2 className={styles.MemberCardCustomerTierName}>{customerTierLevelName}</h2>
        <div className={styles.MemberCardTiersProgress}>
          {customerMemberTierProgressStyles && (
            <div role="progressbar" className={styles.MemberCardProgress}>
              <div className={styles.MemberCardProgressBar} style={customerMemberTierProgressStyles} />
            </div>
          )}

          <ul className={styles.MemberCardTiers}>
            {merchantMembershipTierList.map(merchantMembershipTier => {
              const { level, iconColorPalettes } = merchantMembershipTier;

              return (
                <li key={`member-card-level-${level}`}>
                  <MemberIcon
                    className={styles.MemberCardTierIcon}
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
        <div className={styles.MemberCardTierProgressPromptContainer}>
          <p className={styles.MemberCardTierProgressPrompt}>
            {_isEmpty(customerCurrentStatusParams) ? (
              t(messageI18nKey)
            ) : (
              <Trans t={t} i18nKey={messageI18nKey} values={customerCurrentStatusParams} components={<strong />} />
            )}
          </p>

          <button
            data-test-id="rewards.business.membership-detail.member-card.progress-info-tooltip-button"
            className={getClassName(promptToolTipContainerClassNameList)}
            onClick={handleClickCurrentMemberTierPromptToolTip}
          >
            <Info size={16} />
            <div className={styles.MemberCardTierProgressPromptToolTip}>
              <span className={styles.MemberCardTierProgressPromptToolTipText}>{t('LevelUpdateRuleText')}</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
