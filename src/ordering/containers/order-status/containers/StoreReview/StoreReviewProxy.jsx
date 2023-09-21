import { useMount } from 'react-use';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import StoreReview from '.';
import ErrorResult from './components/ErrorResult';
import Frame from '../../../../../common/components/Frame';
import PageLoader from '../../../../../components/PageLoader';
import { mounted, ErrorResultOkayButtonClicked as okayButtonClicked, goBack } from './redux/thunks';
import { getShouldShowPageLoader, getShouldShowUnsupportedError } from './redux/selectors';
import { getIsStoreReviewExpired, getOffline } from '../../redux/selector';
import { gotoHome } from '../../../../../utils/native-methods';

const StoreReviewProxy = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('OrderingThankYou');

  useMount(() => {
    dispatch(mounted());
  });

  const shouldShowPageLoader = useSelector(getShouldShowPageLoader);
  const shouldShowExpiredError = useSelector(getIsStoreReviewExpired);
  const shouldShowUnsupportedError = useSelector(getShouldShowUnsupportedError);
  const offline = useSelector(getOffline);

  const handleClickOkayButton = useCallback(() => dispatch(okayButtonClicked()), [dispatch]);
  const handleClickBackButton = useCallback(() => {
    offline ? dispatch(gotoHome()) : dispatch(goBack());
  }, [dispatch, offline]);

  return (
    <Frame>
      {shouldShowPageLoader ? (
        <PageLoader />
      ) : shouldShowExpiredError ? (
        <ErrorResult
          title={t('ExpiredErrorTitle')}
          content={t('ExpiredErrorDescription')}
          onCloseButtonClick={handleClickOkayButton}
          onBackArrowClick={handleClickBackButton}
        />
      ) : shouldShowUnsupportedError ? (
        <ErrorResult
          title={t('UnsupportedErrorTitle')}
          content={t('UnsupportedErrorDescription')}
          onCloseButtonClick={handleClickOkayButton}
          onBackArrowClick={handleClickBackButton}
        />
      ) : (
        <StoreReview />
      )}
    </Frame>
  );
};

StoreReviewProxy.displayName = 'StoreReviewProxy';

export default StoreReviewProxy;
