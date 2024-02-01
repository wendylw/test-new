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
  getNewMemberIn18nParams,
  getReturningMemberPromptCategory,
} from '../../redux/selectors';
import { alert, toast } from '../../../../../../../common/utils/feedback';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './MemberPrompt.module.scss';

const CELEBRATION_ANIMATION_TIME = 3600;
const NewMember = () => {
  const { t } = useTranslation(['Rewards']);
  const newMemberPromptCategory = useSelector(getNewMemberPromptCategory);
  const newMemberIn18nParams = useSelector(getNewMemberIn18nParams);
  const newMemberIcon = NEW_MEMBER_ICONS[newMemberPromptCategory];
  const newMemberContentI18nKeys = NEW_MEMBER_I18N_KEYS[newMemberPromptCategory];
  const { titleI18nKey, descriptionI18nKey, titleI18nParamsKeys } = newMemberContentI18nKeys || {};
  const [celebrationAnimateImage, setCelebrationAnimateImage] = useState(NewMemberCelebrationAnimateImage);
  const isCelebrationAnimationDisplay = celebrationAnimateImage && newMemberPromptCategory;
  const newMemberTitleI18nParams = {};

  if (titleI18nParamsKeys) {
    titleI18nParamsKeys.forEach(key => {
      newMemberTitleI18nParams[key] = newMemberIn18nParams[key];
    });
  }

  useEffect(() => {
    if (newMemberContentI18nKeys) {
      const content = (
        <div className={styles.NewMemberContent}>
          {newMemberIcon && (
            <div className={styles.NewMemberIcon}>
              <ObjectFitImage noCompression src={newMemberIcon} alt="Store New Member Icon in StoreHub" />
            </div>
          )}
          {titleI18nKey && (
            <h4 className={styles.NewMemberTitle}>
              {titleI18nParamsKeys ? t(titleI18nKey, newMemberTitleI18nParams) : t(titleI18nKey)}
            </h4>
          )}
          {descriptionI18nKey && <p className={styles.NewMemberDescription}>{t(descriptionI18nKey)}</p>}
        </div>
      );

      setTimeout(() => {
        setCelebrationAnimateImage(null);
      }, CELEBRATION_ANIMATION_TIME);

      alert(content);
    }
  }, [newMemberContentI18nKeys, t, titleI18nKey, descriptionI18nKey, newMemberIcon]);

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
  const { titleI18nKey, descriptionI18nKey } = returningMemberContentI18nKeys || {};

  useEffect(() => {
    if (returningMemberContentI18nKeys) {
      const content = (
        <div className={styles.ReturningMemberContent}>
          {returningMemberIcon && (
            <div className={styles.ReturningMemberIcon}>
              <ObjectFitImage noCompression src={returningMemberIcon} alt="Store Returning Member Icon in StoreHub" />
            </div>
          )}
          {titleI18nKey && <h4 className={styles.ReturningMemberTitle}>{t(titleI18nKey)}</h4>}
          {descriptionI18nKey && <p className={styles.ReturningMemberDescription}>{t(descriptionI18nKey)}</p>}
        </div>
      );

      isFromJoinMembershipUrlClick ? toast.success(t(titleI18nKey)) : alert(content);
    }
  }, [
    returningMemberContentI18nKeys,
    isFromJoinMembershipUrlClick,
    t,
    titleI18nKey,
    descriptionI18nKey,
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
