import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import BeepWarningImage from '../../../../../images/beep-warning.svg';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { closeWebView } from '../../../../../utils/native-methods';
import { getMerchantDisplayName } from '../../../../redux/modules/merchant/selectors';
import { getIsWeb, getIsWebview } from '../../../../redux/modules/common/selectors';
import {
  getIsSkeletonLoaderShow,
  getIsClaimUniquePromoRequestFulfilled,
  getAnyRequestError,
  getUniquePromoQRcodeInvalidError,
} from './redux/selectors';
import { mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import ResultContent from '../../../../../common/components/Result/ResultContent';
import { result } from '../../../../../common/utils/feedback';
import SkeletonLoader from './components/SkeletonLoader';
import ClaimSuccess from './ClaimSuccess';
import ClaimUniquePromo from '.';

const ClaimUniquePromoProxy = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const merchantDisplayName = useSelector(getMerchantDisplayName);
  const isWeb = useSelector(getIsWeb);
  const isWebview = useSelector(getIsWebview);
  const isSkeletonLoaderShow = useSelector(getIsSkeletonLoaderShow);
  const isClaimUniquePromoRequestFulfilled = useSelector(getIsClaimUniquePromoRequestFulfilled);
  const anyRequestError = useSelector(getAnyRequestError);
  const uniquePromoQRcodeInvalidError = useSelector(getUniquePromoQRcodeInvalidError);
  const handleClickHeaderBackButton = useCallback(() => {
    if (isWebview) {
      closeWebView();
    }
  }, [isWebview]);

  useMount(() => {
    dispatch(mounted());
  });

  useEffect(() => {
    if (anyRequestError) {
      result(
        <ResultContent
          imageSrc={BeepWarningImage}
          content={t('SomethingWentWrongDescription')}
          title={t('SomethingWentWrongTitle')}
        />,
        {
          customizeContent: true,
          closeButtonContent: t('Retry'),
          onClose: () => {
            dispatch(mounted());
          },
        }
      );
    }
  }, [anyRequestError, dispatch, t]);

  useEffect(() => {
    if (uniquePromoQRcodeInvalidError) {
      result(
        <ResultContent
          imageSrc={BeepWarningImage}
          content={t(uniquePromoQRcodeInvalidError.descriptionKey)}
          title={t(uniquePromoQRcodeInvalidError.titleKey)}
        />,
        {
          customizeContent: true,
          onClose: () => {
            if (!isWebview) {
              window.location.href = `${window.location.protocol}//${process.env.REACT_APP_QR_SCAN_DOMAINS}${PATH_NAME_MAPPING.QRSCAN}`;
            } else {
              closeWebView();
            }
          },
        }
      );
    }
  }, [uniquePromoQRcodeInvalidError, t, isWebview]);

  return (
    <Frame>
      <PageHeader
        isShowBackButton={!isWeb}
        title={`${t('UniquePromoHeaderTitle')}${isSkeletonLoaderShow ? '' : ` - ${merchantDisplayName}`}`}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      {isSkeletonLoaderShow ? (
        <SkeletonLoader />
      ) : isClaimUniquePromoRequestFulfilled ? (
        <ClaimSuccess />
      ) : (
        <ClaimUniquePromo />
      )}
    </Frame>
  );
};

ClaimUniquePromoProxy.displayName = 'ClaimUniquePromo';

export default ClaimUniquePromoProxy;
