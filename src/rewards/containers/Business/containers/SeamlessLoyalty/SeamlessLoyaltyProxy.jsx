import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { closeWebView } from '../../../../../utils/native-methods';
import { getMerchantBusiness, getIsMerchantEnabledMembership } from '../../../../redux/modules/merchant/selectors';
import { getIsWebview, getIsWeb } from '../../../../redux/modules/common/selectors';
import { getSource } from '../../redux/common/selectors';
import {
  getSeamlessLoyaltyPageHashCode,
  getIsAllInitialRequestsCompleted,
  getAnyInitialRequestError,
} from './redux/selectors';
import { mounted } from './redux/thunks';
import { result } from '../../../../../common/utils/feedback';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageToast from '../../../../../common/components/PageToast';
import Loader from '../../../../../common/components/Loader';

const SeamlessLoyaltyProxy = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const merchantBusiness = useSelector(getMerchantBusiness);
  const isWebview = useSelector(getIsWebview);
  const isWeb = useSelector(getIsWeb);
  const source = useSelector(getSource);
  const seamlessLoyaltyPageHashCode = useSelector(getSeamlessLoyaltyPageHashCode);
  const isMerchantEnabledMembership = useSelector(getIsMerchantEnabledMembership);
  const isAllInitialRequestsCompleted = useSelector(getIsAllInitialRequestsCompleted);
  const anyInitialRequestError = useSelector(getAnyInitialRequestError);
  const seamlessLoyaltyURL = `${process.env.REACT_APP_MERCHANT_STORE_URL.replace('%business%', merchantBusiness)}${
    PATH_NAME_MAPPING.CASHBACK_BASE
  }${PATH_NAME_MAPPING.STORE_REDEMPTION}?h=${seamlessLoyaltyPageHashCode}`;
  const handleClickHeaderBackButton = useCallback(() => {
    if (isWebview) {
      closeWebView();
    }
  }, [isWebview]);

  useMount(() => {
    if (isWeb) {
      window.location.href = seamlessLoyaltyURL;
    } else {
      dispatch(mounted());
    }
  });

  useEffect(() => {
    if (isAllInitialRequestsCompleted) {
      const membershipDetailHistory = {
        pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.MEMBERSHIP_DETAIL}`,
        search: `?business=${merchantBusiness}&source=${source}`,
      };

      isMerchantEnabledMembership ? history.push(membershipDetailHistory) : (window.location.href = seamlessLoyaltyURL);
    }
  }, [
    isAllInitialRequestsCompleted,
    isMerchantEnabledMembership,
    history,
    seamlessLoyaltyURL,
    merchantBusiness,
    source,
  ]);

  useEffect(() => {
    if (anyInitialRequestError) {
      result(t('SomethingWentWrongDescription'), {
        title: t('SomethingWentWrongTitle'),
        closeButtonContent: t('Retry'),
        onClose: () => {
          dispatch(mounted());
        },
      });
    }
  }, [anyInitialRequestError]);

  return (
    <Frame>
      {!isWeb && <PageHeader onBackArrowClick={handleClickHeaderBackButton} />}
      <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
    </Frame>
  );
};

SeamlessLoyaltyProxy.displayName = 'SeamlessLoyaltyProxy';

export default SeamlessLoyaltyProxy;
