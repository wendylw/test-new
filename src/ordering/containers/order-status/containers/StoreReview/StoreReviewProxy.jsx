import { useMount } from 'react-use';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import StoreReview from '.';
import ErrorResult from './components/ErrorResult';
import Frame from '../../../../../common/components/Frame';
import { mounted, goToMenuPage } from './redux/thunks';
import { getIsStoreReviewExpired, getIsStoreReviewable } from '../../redux/selector';

const StoreReviewProxy = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('OrderingThankYou');

  useMount(() => {
    dispatch(mounted());
  });

  const shouldShowExpiredError = useSelector(getIsStoreReviewExpired);
  const shouldShowSurveySheet = useSelector(getIsStoreReviewable);

  const handleClickOkayButton = useCallback(() => dispatch(goToMenuPage()), [dispatch]);

  return (
    <Frame>
      {shouldShowSurveySheet ? (
        <StoreReview />
      ) : shouldShowExpiredError ? (
        <ErrorResult
          title={t('ExpiredErrorTitle')}
          content={t('ExpiredErrorDescription')}
          onCloseButtonClick={handleClickOkayButton}
        />
      ) : (
        <ErrorResult
          title={t('UnsupportedErrorTitle')}
          content={t('UnsupportedErrorDescription')}
          onCloseButtonClick={handleClickOkayButton}
        />
      )}
    </Frame>
  );
};

StoreReviewProxy.displayName = 'StoreReviewProxy';

export default StoreReviewProxy;
