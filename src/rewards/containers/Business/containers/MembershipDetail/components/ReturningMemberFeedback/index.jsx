import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsReturningMember } from '../selectors';
import { toast } from '../../../../../../../common/utils/feedback';

const ReturningMemberFeedback = () => {
  const { t } = useTranslation(['Rewards']);
  const isReturningMember = useSelector(getIsReturningMember);
  let content = null;

  useEffect(() => {
    if (isReturningMember) {
      content = t('DefaultReturningMemberMessage');

      toast.success(content);
    }
  }, [isReturningMember]);
};

ReturningMemberFeedback.displayName = 'ReturningMemberFeedback';

export default ReturningMemberFeedback;
