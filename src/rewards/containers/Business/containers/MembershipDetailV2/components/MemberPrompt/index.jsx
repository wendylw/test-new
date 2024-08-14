import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewMemberCelebrationAnimateImage from '../../../../../../../images/succeed-animation.gif';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import {
  NEW_MEMBER_ICONS,
  NEW_MEMBER_I18N_KEYS,
  RETURNING_MEMBER_ICONS,
  RETURNING_MEMBER_I18N_KEYS,
} from '../../utils/constants';
import { getMerchantBusiness } from '../../../../../../../redux/modules/merchant/selectors';
import { getIsNewMember } from '../../../../redux/common/selectors';
import { getIsFromJoinMembershipUrlClick } from '../../../../../../redux/modules/common/selectors';
import {
  getNewMemberPromptCategory,
  getNewMemberTitleIn18nParams,
  getReturningMemberPromptCategory,
  getReturningMemberTitleIn18nParams,
  getClaimOrderRewardsPrompt,
} from '../../redux/selectors';
import { alert, toast } from '../../../../../../../common/utils/feedback';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './MemberPrompt.module.scss';

const CELEBRATION_ANIMATION_TIME = 3600;

const NewMember = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const newMemberPromptCategory = useSelector(getNewMemberPromptCategory);
  const newMemberTitleIn18nParams = useSelector(getNewMemberTitleIn18nParams);
  const newMemberClaimOrderRewardsPrompt = useSelector(getClaimOrderRewardsPrompt);
  const newMemberIcon = NEW_MEMBER_ICONS[newMemberPromptCategory];
  const newMemberContentI18nKeys = NEW_MEMBER_I18N_KEYS[newMemberPromptCategory];
  const { titleI18nKey, descriptionI18nKey } = newMemberContentI18nKeys || {};
  const [celebrationAnimateImage, setCelebrationAnimateImage] = useState(NewMemberCelebrationAnimateImage);
  const isCelebrationAnimationDisplay = celebrationAnimateImage && newMemberPromptCategory;
  const handleCloseNewMemberPrompt = useCallback(() => {
    const pathname = `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.MEMBERSHIP_DETAIL}`;
    const search = `?business=${merchantBusiness}`;
    // Replace the current URL with the original URL: Fixed shown pop-up issue when user click the back button
    history.replace({ pathname, search });
  }, [merchantBusiness, history]);
  const getContent = ({ title, description, icons }) => (
    <div className={styles.NewMemberContent}>
      {icons && icons}
      {title && <h4 className={styles.NewMemberTitle}>{title}</h4>}
      {description && <p className={styles.NewMemberDescription}>{description}</p>}
    </div>
  );

  useEffect(() => {
    if (newMemberClaimOrderRewardsPrompt) {
      setTimeout(() => {
        setCelebrationAnimateImage(null);
      }, CELEBRATION_ANIMATION_TIME);

      newMemberClaimOrderRewardsPrompt.forEach(prompt => {
        const { id, title, description, icons } = prompt;

        alert(
          getContent({
            title,
            description,
            icons:
              icons &&
              icons.map(icon => (
                <div key={`new-member-icon-${id}`} className={styles.NewMemberIcon}>
                  <ObjectFitImage noCompression src={icon} alt="Store New Member Icon in StoreHub" />
                </div>
              )),
          }),
          {
            id: `NewMember${id}`,
            onClose: handleCloseNewMemberPrompt,
          }
        );
      });
    }
  }, [newMemberClaimOrderRewardsPrompt, handleCloseNewMemberPrompt]);

  useEffect(() => {
    if (newMemberContentI18nKeys) {
      setTimeout(() => {
        setCelebrationAnimateImage(null);
      }, CELEBRATION_ANIMATION_TIME);

      alert(
        getContent({
          title:
            titleI18nKey && newMemberTitleIn18nParams ? t(titleI18nKey, newMemberTitleIn18nParams) : t(titleI18nKey),
          description: descriptionI18nKey && t(descriptionI18nKey),
          icons: newMemberIcon && (
            <div className={styles.NewMemberIcon}>
              <ObjectFitImage noCompression src={newMemberIcon} alt="Store New Member Icon in StoreHub" />
            </div>
          ),
        }),
        {
          id: `NewMember${newMemberPromptCategory}`,
          onClose: handleCloseNewMemberPrompt,
        }
      );
    }
  }, [
    newMemberContentI18nKeys,
    t,
    titleI18nKey,
    descriptionI18nKey,
    newMemberIcon,
    newMemberTitleIn18nParams,
    handleCloseNewMemberPrompt,
    newMemberPromptCategory,
  ]);

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
  const history = useHistory();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isFromJoinMembershipUrlClick = useSelector(getIsFromJoinMembershipUrlClick);
  const returningMemberPromptCategory = useSelector(getReturningMemberPromptCategory);
  const returningMemberTitleIn18nParams = useSelector(getReturningMemberTitleIn18nParams);
  const returnMemberClaimOrderRewardsPrompt = useSelector(getClaimOrderRewardsPrompt);
  const returningMemberIcon = RETURNING_MEMBER_ICONS[returningMemberPromptCategory];
  const returningMemberContentI18nKeys = RETURNING_MEMBER_I18N_KEYS[returningMemberPromptCategory];
  const { titleI18nKey, descriptionI18nKey } = returningMemberContentI18nKeys || {};
  const handleCloseReturningMemberPrompt = useCallback(() => {
    const pathname = `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.MEMBERSHIP_DETAIL}`;
    const search = `?business=${merchantBusiness}`;

    // Replace the current URL with the original URL: Fixed shown pop-up issue when user click the back button
    history.replace({ pathname, search });
  }, [merchantBusiness, history]);
  const getContent = ({ title, description, icons }) => (
    <div className={styles.NewMemberContent}>
      {icons && icons}
      {title && <h4 className={styles.NewMemberTitle}>{title}</h4>}
      {description && <p className={styles.NewMemberDescription}>{description}</p>}
    </div>
  );

  useEffect(() => {
    if (returnMemberClaimOrderRewardsPrompt) {
      returnMemberClaimOrderRewardsPrompt.forEach(prompt => {
        const { id, title, description, icons } = prompt;

        alert(
          getContent({
            title,
            description,
            icons:
              icons &&
              icons.map(icon => (
                <div key={`returning-member-icon-${id}`} className={styles.NewMemberIcon}>
                  <ObjectFitImage noCompression src={icon} alt="Store Return Member Icon in StoreHub" />
                </div>
              )),
          }),
          {
            id: `NewMember${id}`,
            onClose: handleCloseReturningMemberPrompt,
          }
        );
      });
    }
  }, [returnMemberClaimOrderRewardsPrompt, handleCloseReturningMemberPrompt]);

  useEffect(() => {
    if (returningMemberContentI18nKeys) {
      isFromJoinMembershipUrlClick
        ? toast.success(t(titleI18nKey), {
            onClose: handleCloseReturningMemberPrompt,
          })
        : alert(
            getContent({
              title:
                titleI18nKey && returningMemberTitleIn18nParams
                  ? t(titleI18nKey, returningMemberTitleIn18nParams)
                  : t(titleI18nKey),
              description: descriptionI18nKey && t(descriptionI18nKey),
              icons: returningMemberIcon && (
                <div className={styles.returningMemberIcon}>
                  <ObjectFitImage noCompression src={returningMemberIcon} alt="Store Return Member Icon in StoreHub" />
                </div>
              ),
            }),
            {
              id: `ReturningMember${returningMemberPromptCategory}`,
              onClose: handleCloseReturningMemberPrompt,
            }
          );
    }
  }, [
    returningMemberContentI18nKeys,
    isFromJoinMembershipUrlClick,
    t,
    titleI18nKey,
    descriptionI18nKey,
    returningMemberIcon,
    returningMemberTitleIn18nParams,
    handleCloseReturningMemberPrompt,
    returningMemberPromptCategory,
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
