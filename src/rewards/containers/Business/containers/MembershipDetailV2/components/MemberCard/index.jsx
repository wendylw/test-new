import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Info, User } from 'phosphor-react';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getIsLogin } from '../../../../../../../redux/modules/user/selectors';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import { getIsWebview } from '../../../../../../redux/modules/common/selectors';
import {
  getMemberCardStyles,
  getMerchantMembershipTierList,
  getCustomerMemberTierProgressStyles,
  getCustomerCurrentStatusPromptI18nInfo,
  getIsProfileModalShow,
} from '../../redux/selectors';
import { showProfileForm, hideWebProfileForm } from '../../redux/thunks';
import MemberIcon from '../../../../components/MemberIcon';
import Button from '../../../../../../../common/components/Button';
import Profile from '../../../../../Profile';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isLogin = useSelector(getIsLogin);
  const isWebview = useSelector(getIsWebview);
  const customerTierLevelName = useSelector(getCustomerTierLevelName);
  const isProfileModalShow = useSelector(getIsProfileModalShow);
  const memberCardStyles = useSelector(getMemberCardStyles);
  const merchantMembershipTierList = useSelector(getMerchantMembershipTierList);
  const customerMemberTierProgressStyles = useSelector(getCustomerMemberTierProgressStyles);
  const customerCurrentStatusPromptI18nInfo = useSelector(getCustomerCurrentStatusPromptI18nInfo);
  const { messageI18nKey, messageI18nParams } = customerCurrentStatusPromptI18nInfo || {};
  const [promptToolTipShown, setPromptToolTipShown] = useState(false);
  const handleClickCurrentMemberTierPromptToolTip = useCallback(() => {
    setPromptToolTipShown(!promptToolTipShown);
  }, [promptToolTipShown, setPromptToolTipShown]);
  const handleClickViewProfileButton = useCallback(() => dispatch(showProfileForm()), [dispatch]);
  const handleClickSkipProfileButton = useCallback(() => dispatch(hideWebProfileForm()), [dispatch]);
  const handleClickSaveProfileButton = useCallback(() => dispatch(hideWebProfileForm()), [dispatch]);

  return (
    <>
      <section className={styles.MemberCardSection}>
        <div className={styles.MemberCard} style={memberCardStyles}>
          <div className={styles.MemberCardTop}>
            <h2 className={styles.MemberCardCustomerTierName}>{customerTierLevelName}</h2>
            {isLogin && (
              <Button
                data-test-id="rewards.business.membership-detail.member-card.view-profile-button"
                contentClassName={styles.MemberCardViewProfileButtonContent}
                type="text"
                theme="ghost"
                onClick={handleClickViewProfileButton}
              >
                <User size={14} />
                <span className={styles.MemberCardViewProfileText}>{t('ViewProfile')}</span>
              </Button>
            )}
          </div>
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
          {customerCurrentStatusPromptI18nInfo && (
            <div className={styles.MemberCardTierProgressPromptContainer}>
              <p className={styles.MemberCardTierProgressPrompt}>
                <Trans t={t} i18nKey={messageI18nKey} values={messageI18nParams} components={<strong />} />
              </p>

              <button
                data-test-id="rewards.business.membership-detail.member-card.progress-info-tooltip-button"
                className={getClassName([
                  styles.MemberCardTierProgressPromptToolTipContainer,
                  promptToolTipShown ? styles.MemberCardTierProgressPromptToolTipContainer__show : null,
                ])}
                onClick={handleClickCurrentMemberTierPromptToolTip}
              >
                <Info size={18} />
                <div className={styles.MemberCardTierProgressPromptToolTip}>
                  <span className={styles.MemberCardTierProgressPromptToolTipText}>{t('LevelUpdateRuleText')}</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </section>
      {/* TODO: Migrate to membership detail component next phase */}
      {!isWebview && (
        <Profile
          show={isProfileModalShow}
          onSave={handleClickSaveProfileButton}
          onSkip={handleClickSkipProfileButton}
        />
      )}
    </>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
