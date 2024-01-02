import React from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
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

const NewMember = () => {
  const { t } = useTranslation(['Rewards']);
  const newMemberPromptCategory = useSelector(getNewMemberPromptCategory);
  const newMemberIcon = NEW_MEMBER_ICONS[newMemberPromptCategory];
  const newMemberContentI18nKeys = NEW_MEMBER_I18N_KEYS[newMemberPromptCategory];
  const { titleI18Key, descriptionI18Key } = newMemberContentI18nKeys || {};

  useMount(() => {
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

    alert(content);
  });

  return <></>;
};

NewMember.displayName = 'NewMember';

const ReturningMember = () => {
  const { t } = useTranslation(['Rewards']);
  const isFromJoinMembershipUrlClick = useSelector(getIsFromJoinMembershipUrlClick);
  const returningMemberPromptCategory = useSelector(getReturningMemberPromptCategory);
  const returningMemberIcon = RETURNING_MEMBER_ICONS[returningMemberPromptCategory];
  const returningMemberContentI18nKeys = RETURNING_MEMBER_I18N_KEYS[returningMemberPromptCategory];
  const { titleI18Key, descriptionI18Key } = returningMemberContentI18nKeys;

  useMount(() => {
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
