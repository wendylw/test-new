import React, { useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMount, useUnmount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { PATH_NAME_MAPPING } from '../../../common/utils/constants';
import { closeWebView } from '../../../utils/native-methods';
import usePrefetch from '../../../common/utils/hooks/usePrefetch';
import { getIsUserLogin as getIsAppUserLogin } from '../../redux/modules/app';
import { actions as commonActions } from '../../redux/modules/common';
import { getIsWeb, getIsWebview } from '../../redux/modules/common/selectors';
import { getIsLogin } from '../../../redux/modules/user/selectors';
import { initUserInfo } from '../../../redux/modules/user/thunks';
import { getIsMerchantMembershipEnabled } from '../../../redux/modules/merchant/selectors';
import { getCustomerId } from '../../redux/modules/customer/selectors';
import {
  getOrderReceiptNumber,
  getClaimedCashbackForCustomerStatus,
  getIsClaimedCashbackForCustomerFulfilled,
  getClaimedOrderCashbackStatus,
  getIsClaimCashbackLoaderShow,
} from './redux/selectors';
import { actions as claimCashbackActions } from './redux';
import { mounted, claimedCashbackAndContinueNextStep } from './redux/thunks';
import Frame from '../../../common/components/Frame';
import PageHeader from '../../../common/components/PageHeader';
import PageToast from '../../../common/components/PageToast';
import Loader from '../../../common/components/Loader';
import MerchantInfo from './components/MerchantInfo';
import CashbackBlock from './components/CashbackBlock';
import styles from './ClaimCashback.module.scss';

const ClaimCashback = () => {
  const { t } = useTranslation(['Cashback']);
  const dispatch = useDispatch();
  const history = useHistory();
  const isAppUserLogin = useSelector(getIsAppUserLogin);
  const isWeb = useSelector(getIsWeb);
  const isWebview = useSelector(getIsWebview);
  const isLogin = useSelector(getIsLogin);
  const isMerchantMembershipEnabled = useSelector(getIsMerchantMembershipEnabled);
  const customerId = useSelector(getCustomerId);
  const isClaimedCashbackForCustomerFulfilled = useSelector(getIsClaimedCashbackForCustomerFulfilled);
  const orderReceiptNumber = useSelector(getOrderReceiptNumber);
  const claimedCashbackForCustomerStatus = useSelector(getClaimedCashbackForCustomerStatus);
  const orderCashbackStatus = useSelector(getClaimedOrderCashbackStatus);
  const isClaimCashbackLoaderShow = useSelector(getIsClaimCashbackLoaderShow);
  const handleClickHeaderBackButton = useCallback(() => {
    if (isWebview) {
      closeWebView();
    }
  }, [isWebview]);

  usePrefetch(['CB_HM'], ['Cashback']);

  useMount(() => {
    dispatch(mounted());
  });

  useUnmount(() => {
    dispatch(claimCashbackActions.resetClaimCashback());
  });

  useEffect(() => {
    if (isLogin && orderReceiptNumber && !claimedCashbackForCustomerStatus) {
      dispatch(claimedCashbackAndContinueNextStep());
    }
  }, [isLogin, claimedCashbackForCustomerStatus, orderReceiptNumber, dispatch]);

  useEffect(() => {
    if (!isMerchantMembershipEnabled && isClaimedCashbackForCustomerFulfilled && customerId) {
      // TODO: WB-6669: change to new cashback detail page and move to thunks
      history.push({
        pathname: PATH_NAME_MAPPING.CASHBACK_HOME,
        search: `?customerId=${customerId}`,
      });
    }
  }, [isClaimedCashbackForCustomerFulfilled, isMerchantMembershipEnabled, customerId, history]);

  // TODO: WB-6994: remove this useEffect that will redirect to cashback detail page
  useEffect(() => {
    if (!isMerchantMembershipEnabled && orderCashbackStatus) {
      dispatch(commonActions.messageInfoSet({ key: orderCashbackStatus }));
    }
  }, [orderCashbackStatus, dispatch, isMerchantMembershipEnabled]);

  // TODO: WB-6994: remove this useEffect after we have a better solution
  useEffect(() => {
    if (isAppUserLogin) {
      dispatch(initUserInfo());
    }
  }, [isAppUserLogin, dispatch]);

  return (
    <Frame>
      <PageHeader
        title={t('EarnCashbackPageTitle')}
        isShowBackButton={!isWeb}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <MerchantInfo />
      <CashbackBlock />
      {!isLogin && <div className={styles.ClaimCashbackNotLoginBackground} />}
      {isClaimCashbackLoaderShow && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
    </Frame>
  );
};

ClaimCashback.displayName = 'ClaimCashback';

export default ClaimCashback;
