import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount, useUnmount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { closeWebView } from '../../../utils/native-methods';
import usePrefetch from '../../../common/utils/hooks/usePrefetch';
import { getIsWeb, getIsWebview } from '../../redux/modules/app';
import { getIsLogin } from '../../../redux/modules/user/selectors';
import { getOrderReceiptNumber, getClaimedCashbackForCustomerStatus } from './redux/selectors';
import { actions as claimCashbackActions } from './redux';
import { mounted, claimedCashbackForCustomer } from './redux/thunks';
import Frame from '../../../common/components/Frame';
import PageHeader from '../../../common/components/PageHeader';
import MerchantInfo from './components/MerchantInfo';
import CashbackBlock from './components/CashbackBlock';
import styles from './ClaimCashback.module.scss';

const ClaimCashback = () => {
  const { t } = useTranslation(['Cashback']);
  const dispatch = useDispatch();
  const isWeb = useSelector(getIsWeb);
  const isWebview = useSelector(getIsWebview);
  const isLogin = useSelector(getIsLogin);
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
    </Frame>
  );
};

ClaimCashback.displayName = 'ClaimCashback';

export default ClaimCashback;
