import { useMount } from 'react-use';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import ErrorResult from './components/ErrorResult';
import SuccessResult from './components/SuccessResult';
import SkeletonLoader from './components/SkeletonLoader';
import {
  getShouldShowSkeletonLoader,
  getShouldShowUnsupportedError,
  getShouldShowUnknownError,
  getShouldShowCongratulation,
  getShouldShowBackButton,
} from './redux/selectors';
import { mounted, backButtonClicked, retryButtonClicked } from './redux/thunks';
import MembershipForm from '.';
import BeepWarningImage from '../../../../../images/beep-warning.png';

const MembershipFormProxy = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Rewards');

  useMount(() => {
    dispatch(mounted());
  });

  const shouldShowSkeletonLoader = useSelector(getShouldShowSkeletonLoader);
  const shouldShowUnsupportedError = useSelector(getShouldShowUnsupportedError);
  const shouldShowUnknownError = useSelector(getShouldShowUnknownError);
  const shouldShowCongratulation = useSelector(getShouldShowCongratulation);
  const shouldShowBackButton = useSelector(getShouldShowBackButton);

  const handleClickBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickRetryButton = useCallback(() => dispatch(retryButtonClicked()), [dispatch]);

  return (
    <Frame>
      <PageHeader
        title={t('JoinOurMembership')}
        onBackArrowClick={handleClickBackButton}
        isShowBackButton={shouldShowBackButton}
      />
      {shouldShowSkeletonLoader ? (
        <SkeletonLoader />
      ) : shouldShowCongratulation ? (
        <SuccessResult />
      ) : shouldShowUnsupportedError ? (
        <ErrorResult
          title={t('MembershipUnavailableTitle')}
          content={t('MembershipUnavailableDescription')}
          isCloseButtonVisible={false}
        />
      ) : shouldShowUnknownError ? (
        <ErrorResult
          title={t('SomethingWentWrongTitle')}
          content={t('SomethingWentWrongDescription')}
          buttonText={t('Retry')}
          imageSrc={BeepWarningImage}
          onCloseButtonClick={handleClickRetryButton}
        />
      ) : (
        <MembershipForm />
      )}
    </Frame>
  );
};

MembershipFormProxy.displayName = 'MembershipFormProxy';

export default MembershipFormProxy;
