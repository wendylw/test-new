import React from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { BECOME_MERCHANT_MEMBER_METHODS } from '../../../../../../../common/utils/constants';
import MembershipLevelIcon from '../../../../../../../images/membership-level.svg';
import RewardsEarnedCashbackIcon from '../../../../../../../images/rewards-earned-cashback.svg';
import { getSource, getIsNewMember } from '../../../../redux/common/selectors';
import { getIsFromJoinMembershipUrlClick } from '../../redux/selectors';
import { alert, toast } from '../../../../../../../common/utils/feedback';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './MemberPrompt.module.scss';

const NEW_MEMBER_I18N_KEYS = {
  [BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN]: {
    titleKey: 'SeamlessLoyaltyNewMemberTitle',
    descriptionKey: 'SeamlessLoyaltyNewMemberDescription',
  },
  [BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK]: {
    titleKey: 'DefaultNewMemberTitle',
    descriptionKey: 'DefaultNewMemberDescription',
  },
};

const NEW_MEMBER_ICONS = {
  [BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN]: RewardsEarnedCashbackIcon,
  [BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK]: MembershipLevelIcon,
};

const RETURNING_MEMBER_I18N_KEYS = {
  [BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN]: {
    messageKey: 'SeamlessLoyaltyReturningMemberMessage',
  },
  [BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK]: {
    messageKey: 'DefaultReturningMemberMessage',
  },
};

const RETURNING_MEMBER_ICONS = {
  [BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN]: RewardsEarnedCashbackIcon,
};

const NewMember = () => {
  const { t } = useTranslation(['Rewards']);
  const source = useSelector(getSource);
  const newMemberIcon = NEW_MEMBER_ICONS[source] || MembershipLevelIcon;
  const newMemberTitle = t(NEW_MEMBER_I18N_KEYS[source]?.titleKey || 'DefaultNewMemberTitle');
  const newMemberDescription = t(NEW_MEMBER_I18N_KEYS[source]?.descriptionKey || 'DefaultNewMemberDescription');

  useMount(() => {
    const content = (
      <div className={styles.NewMemberContent}>
        <div className={styles.NewMemberIcon}>
          <ObjectFitImage noCompression src={newMemberIcon} alt="Store New Member Icon in StoreHub" />
        </div>
        <h4 className={styles.NewMemberTitle}>{newMemberTitle}</h4>
        <p className={styles.NewMemberDescription}>{newMemberDescription}</p>
      </div>
    );

    alert(content);
  });

  return <></>;
};

NewMember.displayName = 'NewMember';

const ReturningMember = () => {
  const { t } = useTranslation(['Rewards']);
  const source = useSelector(getSource);
  const isFromJoinMembershipUrlClick = useSelector(getIsFromJoinMembershipUrlClick);
  const returningMemberIcon = RETURNING_MEMBER_ICONS[source];
  const returningMemberMessage = t(RETURNING_MEMBER_I18N_KEYS[source]?.titleKey || 'DefaultReturningMemberMessage');

  useMount(() => {
    const content = (
      <div className={styles.ReturningMemberContent}>
        {returningMemberIcon && (
          <div className={styles.ReturningMemberIcon}>
            <ObjectFitImage noCompression src={returningMemberIcon} alt="Store Returning Member Icon in StoreHub" />
          </div>
        )}
        <h4 className={styles.ReturningMemberTitle}>{returningMemberMessage}</h4>
      </div>
    );

    isFromJoinMembershipUrlClick ? toast.success(t('DefaultReturningMemberMessage')) : alert(content);
  });

  return <></>;
};

ReturningMember.displayName = 'ReturningMember';

const MemberPrompt = () => {
  const isNewMember = useSelector(getIsNewMember);

  return isNewMember ? <NewMember /> : <ReturningMember />;
};

MemberPrompt.displayName = 'MemberPrompt';

export default MemberPrompt;
