import { useMount } from 'react-use';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageLoader from '../../../../../components/PageLoader';
import ErrorResult from './components/ErrorResult';
import SuccessResult from './components/SuccessResult';
import {
  getShouldShowPageLoader,
  getShouldShowUnknownError,
  getShouldShowCongratulation,
  getShouldShowBackButton,
} from './redux/selectors';
import { mounted, backButtonClicked, retryButtonClicked, joinNowButtonClicked } from './redux/thunks';
import MembershipForm from '.';

const MembershipFormProxy = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Rewards');

  useMount(() => {
    dispatch(mounted());
  });

  const shouldShowPageLoader = useSelector(getShouldShowPageLoader);
  const shouldShowUnknownError = useSelector(getShouldShowUnknownError);
  const shouldShowCongratulation = useSelector(getShouldShowCongratulation);
  const shouldShowBackButton = useSelector(getShouldShowBackButton);

  const handleClickBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickRetryButton = useCallback(() => dispatch(retryButtonClicked()), [dispatch]);
  const handleJoinNowButton = useCallback(() => dispatch(joinNowButtonClicked()), [dispatch]);

  return (
    <Frame>
      <PageHeader
        title={t('JoinOurMembership')}
        onBackArrowClick={handleClickBackButton}
        isShowBackButton={shouldShowBackButton}
      />
      {shouldShowPageLoader ? (
        <PageLoader />
      ) : shouldShowCongratulation ? (
        <SuccessResult />
      ) : shouldShowUnknownError ? (
        <ErrorResult onCloseButtonClick={handleClickRetryButton} />
      ) : (
        <MembershipForm onJoinButtonClick={handleJoinNowButton} />
      )}
    </Frame>
  );
};

MembershipFormProxy.displayName = 'MembershipFormProxy';

export default MembershipFormProxy;
