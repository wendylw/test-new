import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';

const MyRewardDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('MyRewardDetails')} onBackArrowClick={handleClickHeaderBackButton} />
    </Frame>
  );
};

MyRewardDetail.displayName = 'MyRewardDetail';

export default MyRewardDetail;
