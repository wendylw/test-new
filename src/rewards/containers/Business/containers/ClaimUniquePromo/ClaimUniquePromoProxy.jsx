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
  getIsClaimUniquePromoRequestDuplicated,
  getAnyInitialRequestError,
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
  const anyInitialRequestError = useSelector(getAnyInitialRequestError);
  const isClaimUniquePromoRequestDuplicated = useSelector(getIsClaimUniquePromoRequestDuplicated);
  const handleClickHeaderBackButton = useCallback(() => {
    if (isWebview) {
      closeWebView();
    }
  }, [isWebview]);

  useMount(() => {
    dispatch(mounted());
  });

  useEffect(() => {
    if (anyInitialRequestError) {
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
  }, [anyInitialRequestError, dispatch, t]);

  useEffect(() => {
    if (isClaimUniquePromoRequestDuplicated) {
      result(
        <ResultContent
          imageSrc={BeepWarningImage}
          content={t('UniquePromoDuplicatedDescription')}
          title={t('UniquePromoDuplicatedTitle')}
        />,
        {
          customizeContent: true,
          onClose: () => {
            if (!isWebview) {
              window.location.href = `${process.env.REACT_APP_QR_SCAN_DOMAINS}${PATH_NAME_MAPPING.QRSCAN}`;
            } else {
              closeWebView();
            }
          },
        }
      );
    }
  }, [isClaimUniquePromoRequestDuplicated, t]);

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
