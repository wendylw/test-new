import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MembershipLevelIcon from '../../../../../../../images/membership-level.svg';
import { getIsNewMember } from '../../redux/selectors';
import { alert } from '../../../../../../../common/utils/feedback';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './NewMemberFeedback.module.scss';

const NewMemberFeedback = () => {
  const { t } = useTranslation(['Rewards']);
  const isNewMember = useSelector(getIsNewMember);
  const content = (
    <div className={styles.NewMemberFeedbackContent}>
      <div className={styles.NewMemberFeedbackIcon}>
        <ObjectFitImage noCompression src={MembershipLevelIcon} alt="Store New Member Icon in StoreHub" />
      </div>
      <h4 className={styles.NewMemberFeedbackTitle}>{t('DefaultNewMemberTitle')}</h4>
      <p className={styles.NewMemberFeedbackContent}>{t('DefaultNewMemberDescription')}</p>
    </div>
  );

  useEffect(() => {
    if (isNewMember) {
      alert(content);
    }
  }, [isNewMember]);

  return <></>;
};

NewMemberFeedback.displayName = 'NewMemberFeedback';

export default NewMemberFeedback;
