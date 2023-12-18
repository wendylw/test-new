import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getIsReturningMember } from '../../redux/selectors';
import { toast } from '../../../../../../../common/utils/feedback';

const ReturningMemberFeedback = () => {
  const { t } = useTranslation(['Rewards']);
  const isReturningMember = useSelector(getIsReturningMember);

  useEffect(() => {
    if (isReturningMember) {
      const content = t('DefaultReturningMemberMessage');

      toast.success(content);
    }
  }, [isReturningMember, t]);

  return <></>;
};

ReturningMemberFeedback.displayName = 'ReturningMemberFeedback';

export default ReturningMemberFeedback;
