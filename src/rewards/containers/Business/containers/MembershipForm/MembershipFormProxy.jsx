import { useMount } from 'react-use';
import React, { useEffect, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import BeepWarningImage from '../../../../../images/beep-warning.svg';
import RewardsFailedIcon from '../../../../../images/rewards-failed.svg';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import ErrorResult from './components/ErrorResult';
import SkeletonLoader from './components/SkeletonLoader';
import { getIsLogin } from '../../../../../redux/modules/user/selectors';
import { getIsWebview } from '../../../../redux/modules/common/selectors';
import { getHasUserJoinedMerchantMembership } from '../../../../redux/modules/customer/selectors';
import {
  getShouldShowSkeletonLoader,
  getShouldShowUnsupportedError,
  getShouldShowUnknownError,
  getShouldShowBackButton,
  getIsLoadOrderRewardsNoTransaction,
  getIsProfileFormVisible,
} from './redux/selectors';
import { mounted, backButtonClicked, retryButtonClicked, goToMembershipDetail, loadCustomerInfo } from './redux/thunks';
import MembershipForm from '.';

const MembershipFormProxy = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Rewards');

  useMount(() => {
    dispatch(mounted());
  });

  const isLogin = useSelector(getIsLogin);
  const shouldShowSkeletonLoader = useSelector(getShouldShowSkeletonLoader);
  const shouldShowUnsupportedError = useSelector(getShouldShowUnsupportedError);
  const shouldShowUnknownError = useSelector(getShouldShowUnknownError);
  const isLoadOrderRewardsNoTransaction = useSelector(getIsLoadOrderRewardsNoTransaction);
  const shouldShowBackButton = useSelector(getShouldShowBackButton);
  const hasUserJoinedMerchantMembership = useSelector(getHasUserJoinedMerchantMembership);
  const isProfileFormVisible = useSelector(getIsProfileFormVisible);
  const isWebview = useSelector(getIsWebview);

  useEffect(() => {
    if (isLogin) {
      dispatch(loadCustomerInfo());
    }
  }, [dispatch, isLogin]);

  useEffect(() => {
    // WB-8135: We will change the logic for go to membership detail flow
    if (hasUserJoinedMerchantMembership && !isProfileFormVisible) {
      dispatch(goToMembershipDetail());
    }
  }, [dispatch, hasUserJoinedMerchantMembership, isProfileFormVisible]);

  const handleClickBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickRetryButton = useCallback(() => dispatch(retryButtonClicked()), [dispatch]);

  return (
    <Frame>
      {isWebview && (
        <PageHeader
          title={t('JoinOurMembership')}
          onBackArrowClick={handleClickBackButton}
          isShowBackButton={shouldShowBackButton}
        />
      )}

      {shouldShowSkeletonLoader ? (
        <SkeletonLoader />
      ) : shouldShowUnsupportedError ? (
        <ErrorResult title={t('PageNotFound')} isCloseButtonVisible={false} />
      ) : isLoadOrderRewardsNoTransaction ? (
        <ErrorResult
          isCloseButtonVisible={false}
          title={<Trans t={t} i18nKey="ErrorReceiptGetRewardsNoTransaction" components={[<br />]} />}
          imageSrc={RewardsFailedIcon}
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
