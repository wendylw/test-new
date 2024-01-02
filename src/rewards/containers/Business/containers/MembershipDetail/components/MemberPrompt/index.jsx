import React from 'react';
import { useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import NewMemberCelebrationAnimateImage from '../../../../../../../images/succeed-animation.gif';
import MembershipLevelIcon from '../../../../../../../images/membership-level.svg';
import { getIsNewMember } from '../../../../redux/common/selectors';
import { alert, toast } from '../../../../../../../common/utils/feedback';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './MemberPrompt.module.scss';

const NewMember = () => {
  const { t } = useTranslation(['Rewards']);
  const [celebrationAnimateImage, setCelebrationAnimateImage] = React.useState(NewMemberCelebrationAnimateImage);

  useMount(() => {
    const content = (
      <div className={styles.NewMemberContent}>
        <div className={styles.NewMemberIcon}>
          <ObjectFitImage noCompression src={MembershipLevelIcon} alt="Store New Member Icon in StoreHub" />
        </div>
        <h4 className={styles.NewMemberTitle}>{t('DefaultNewMemberTitle')}</h4>
        <p className={styles.NewMemberContent}>{t('DefaultNewMemberDescription')}</p>
      </div>
    );

    setTimeout(() => {
      setCelebrationAnimateImage(null);
    }, 3600);

    alert(content);
  });

  return (
    celebrationAnimateImage && (
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

  useMount(() => {
    const content = t('DefaultReturningMemberMessage');

    toast.success(content);
  });

  return <></>;
};

ReturningMember.displayName = 'ReturningMember';

const MemberPrompt = () => {
  const isNewMember = useSelector(getIsNewMember) || true;

  return isNewMember ? <NewMember /> : <ReturningMember />;
};

MemberPrompt.displayName = 'MemberPrompt';

export default MemberPrompt;
