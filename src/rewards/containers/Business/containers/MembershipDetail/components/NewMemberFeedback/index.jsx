import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MembershipLevelIcon from '../../../../../../../images/membership-level.svg';
import { getIsNewMember } from '../selectors';
import { alert } from '../../../../../../../common/utils/feedback';
import { ObjectFitImage } from '../../../../../../../common/components/Image';

const NewMemberFeedback = () => {
  const { t } = useTranslation(['Rewards']);
  const isNewMember = useSelector(getIsNewMember);
  let content = null;
  let options = null;

  useEffect(() => {
    if (isNewMember) {
      content = (
        <div>
          <ObjectFitImage src={MembershipLevelIcon} alt="Store New Member Icon in StoreHub" />
          <h4>{t('DefaultNewMemberTitle')}</h4>
          <p>{t('DefaultNewMemberDescription')}</p>
        </div>
      );

      options ? alert(content, options) : alert(content);
    }
  }, [isNewMember]);
};

NewMemberFeedback.displayName = 'NewMemberFeedback';

export default NewMemberFeedback;
