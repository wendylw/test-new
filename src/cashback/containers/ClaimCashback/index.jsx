import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount, useUnmount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { closeWebView } from '../../../utils/native-methods';
import usePrefetch from '../../../common/utils/hooks/usePrefetch';
import { getIsWeb, getIsWebview, getIsUserLogin } from '../../redux/modules/app';
import { actions as claimActions, getReceiptNumber, getCashbackClaimRequestStatus } from '../../redux/modules/claim';
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
  const isUserLogin = useSelector(getIsUserLogin);
  const receiptNumber = useSelector(getReceiptNumber);
  const claimRequestStatus = useSelector(getCashbackClaimRequestStatus);
  const handleClickHeaderBackButton = useCallback(() => {
    if (isWebview) {
      closeWebView();
    }
  }, [isWebview]);

  usePrefetch(['CB_HM'], ['Cashback']);

  useMount(() => {
    dispatch(claimActions.mounted());
  });

  useUnmount(() => {
    dispatch(claimActions.resetData());
  });

  useEffect(() => {
    if (isUserLogin && receiptNumber && !claimRequestStatus) {
      dispatch(claimActions.claimCashbackForConsumer(receiptNumber));
    }
  }, [isUserLogin, claimRequestStatus, receiptNumber, dispatch]);

  return (
    <Frame>
      <PageHeader
        title={t('EarnCashbackPageTitle')}
        isShowBackButton={!isWeb}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <MerchantInfo />
      <CashbackBlock />
      {!isUserLogin && <div className={styles.ClaimCashbackNotLoginBackground} />}
    </Frame>
  );
};

ClaimCashback.displayName = 'ClaimCashback';

export default ClaimCashback;
