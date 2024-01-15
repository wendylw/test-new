import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import NewMemberCelebrationAnimateImage from '../../../../../../../images/succeed-animation.gif';
import {
  NEW_MEMBER_ICONS,
  NEW_MEMBER_I18N_KEYS,
  RETURNING_MEMBER_ICONS,
  RETURNING_MEMBER_I18N_KEYS,
} from '../../utils/constants';
import { getIsNewMember } from '../../../../redux/common/selectors';
import {
  getIsFromJoinMembershipUrlClick,
  getNewMemberPromptCategory,
  getReturningMemberPromptCategory,
} from '../../redux/selectors';
import { alert, toast } from '../../../../../../../common/utils/feedback';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './MemberPrompt.module.scss';

const CELEBRATION_ANIMATION_TIME = 3600;
const NewMember = () => {
  const { t } = useTranslation(['Rewards']);
  const newMemberPromptCategory = useSelector(getNewMemberPromptCategory);
  const newMemberIcon = NEW_MEMBER_ICONS[newMemberPromptCategory];
  const newMemberContentI18nKeys = NEW_MEMBER_I18N_KEYS[newMemberPromptCategory];
  const { titleI18Key, descriptionI18Key } = newMemberContentI18nKeys || {};
  const [celebrationAnimateImage, setCelebrationAnimateImage] = useState(NewMemberCelebrationAnimateImage);
  const isCelebrationAnimationDisplay = celebrationAnimateImage && newMemberPromptCategory;

  useEffect(() => {
    if (newMemberContentI18nKeys) {
      const content = (
        <div className={styles.NewMemberContent}>
          {newMemberIcon && (
            <div className={styles.NewMemberIcon}>
              <ObjectFitImage noCompression src={newMemberIcon} alt="Store New Member Icon in StoreHub" />
            </div>
          )}
          {titleI18Key && <h4 className={styles.NewMemberTitle}>{t(titleI18Key)}</h4>}
          {descriptionI18Key && <p className={styles.NewMemberDescription}>{t(descriptionI18Key)}</p>}
        </div>
      );

      setTimeout(() => {
        setCelebrationAnimateImage(null);
      }, CELEBRATION_ANIMATION_TIME);

      alert(content);
    }
  }, [newMemberContentI18nKeys, t, titleI18Key, descriptionI18Key, newMemberIcon]);

  return (
    isCelebrationAnimationDisplay && (
      <div className={styles.NewMemberCelebrationAnimateImageContainer}>
        <img
          className={styles.NewMemberCelebrationAnimateImage}
          src={celebrationAnimateImage}
          alt="New Member Celebration in StoreHub"
        />
      </div>
    )
  );
};

NewMember.displayName = 'NewMember';

const ReturningMember = () => {
  const { t } = useTranslation(['Rewards']);
  const isFromJoinMembershipUrlClick = useSelector(getIsFromJoinMembershipUrlClick);
  const returningMemberPromptCategory = useSelector(getReturningMemberPromptCategory);
  const returningMemberIcon = RETURNING_MEMBER_ICONS[returningMemberPromptCategory];
  const returningMemberContentI18nKeys = RETURNING_MEMBER_I18N_KEYS[returningMemberPromptCategory];
  const { titleI18Key, descriptionI18Key } = returningMemberContentI18nKeys || {};

  useEffect(() => {
    if (returningMemberContentI18nKeys) {
      const content = (
        <div className={styles.ReturningMemberContent}>
          {returningMemberIcon && (
            <div className={styles.ReturningMemberIcon}>
              <ObjectFitImage noCompression src={returningMemberIcon} alt="Store Returning Member Icon in StoreHub" />
            </div>
          )}
          {titleI18Key && <h4 className={styles.ReturningMemberTitle}>{t(titleI18Key)}</h4>}
          {descriptionI18Key && <p className={styles.ReturningMemberDescription}>{t(descriptionI18Key)}</p>}
        </div>
      );

      isFromJoinMembershipUrlClick ? toast.success(t(titleI18Key)) : alert(content);
    }
  }, [
    returningMemberContentI18nKeys,
    isFromJoinMembershipUrlClick,
    t,
    titleI18Key,
    descriptionI18Key,
    returningMemberIcon,
  ]);

  return <></>;
};

ReturningMember.displayName = 'ReturningMember';

const MemberPrompt = () => {
  const isNewMember = useSelector(getIsNewMember);

  return isNewMember ? <NewMember /> : <ReturningMember />;
};

MemberPrompt.displayName = 'MemberPrompt';

export default MemberPrompt;
