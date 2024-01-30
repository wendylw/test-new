import React, { useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMount, useUnmount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { PATH_NAME_MAPPING } from '../../../common/utils/constants';
import { closeWebView } from '../../../utils/native-methods';
import usePrefetch from '../../../common/utils/hooks/usePrefetch';
import { getIsUserLogin as getIsAppUserLogin } from '../../redux/modules/app';
import { getIsWeb, getIsWebview } from '../../redux/modules/common/selectors';
import { getIsLogin } from '../../../redux/modules/user/selectors';
import { initUserInfo } from '../../../redux/modules/user/thunks';
import { getCustomerId } from '../../redux/modules/customer/selectors';
import {
  getOrderReceiptNumber,
  getClaimedCashbackForCustomerStatus,
  getIsClaimedCashbackForCustomerFulfilled,
} from './redux/selectors';
import { actions as claimCashbackActions } from './redux';
import { mounted, claimedCashbackForCustomer } from './redux/thunks';
import Frame from '../../../common/components/Frame';
import PageHeader from '../../../common/components/PageHeader';
import MerchantInfo from './components/MerchantInfo';
import CashbackBlock from './components/CashbackBlock';
import PhoneNumberInput from '../../../common/components/Input/PhoneNumberInput/PhoneNumberInput';
import styles from './ClaimCashback.module.scss';

const ClaimCashback = () => {
  const { t } = useTranslation(['Cashback']);
  const dispatch = useDispatch();
  const history = useHistory();
  const isAppUserLogin = useSelector(getIsAppUserLogin);
  const isWeb = useSelector(getIsWeb);
  const isWebview = useSelector(getIsWebview);
  const isLogin = useSelector(getIsLogin);
  const customerId = useSelector(getCustomerId);
  const isClaimedCashbackForCustomerFulfilled = useSelector(getIsClaimedCashbackForCustomerFulfilled);
  const orderReceiptNumber = useSelector(getOrderReceiptNumber);
  const claimedCashbackForCustomerStatus = useSelector(getClaimedCashbackForCustomerStatus);
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
      dispatch(claimedCashbackForCustomer());
    }
  }, [isLogin, claimedCashbackForCustomerStatus, orderReceiptNumber, dispatch]);

  useEffect(() => {
    if (isClaimedCashbackForCustomerFulfilled && customerId) {
      // TODO: WB-6669: change to new cashback detail page and move to thunks
      history.push(`${PATH_NAME_MAPPING.CASHBACK_BASE}?customerId=${customerId}`);
    }
  }, [isClaimedCashbackForCustomerFulfilled, customerId, history]);

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
      <PhoneNumberInput />
      {!isLogin && <div className={styles.ClaimCashbackNotLoginBackground} />}
    </Frame>
  );
};

ClaimCashback.displayName = 'ClaimCashback';

export default ClaimCashback;
