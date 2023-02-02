import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import dayjs from 'dayjs';
import { getIsTNGMiniProgram, getIsWebview } from '../../../../../redux/modules/app';
import {
  getStoreRating,
  getStoreComment,
  getStoreGoogleReviewURL,
  getStoreReviewInfoData,
  getIsStoreReviewSupportable,
  getStoreReviewLoadDataRequest,
  getOffline,
} from '../../../redux/selector';
import { STORE_REVIEW_HIGH_RATING, STORE_REVIEW_ERROR_CODES } from '../constants';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { isValidDate } from '../../../../../../utils/datetime-lib';

export const getIsHighRatedReview = createSelector(getStoreRating, rating => rating >= STORE_REVIEW_HIGH_RATING);

export const getIsCommentEmpty = createSelector(getStoreComment, comment => _isEmpty(comment));

export const getIsGoogleReviewURLAvailable = createSelector(
  getStoreGoogleReviewURL,
  googleReviewURL => !_isEmpty(googleReviewURL)
);

export const getShouldShowOkayButtonOnly = createSelector(
  getIsTNGMiniProgram,
  getIsHighRatedReview,
  getIsGoogleReviewURLAvailable,
  (isTNGMiniProgram, isHighRatedReview, isGoogleReviewURLAvailable) =>
    isTNGMiniProgram || !(isHighRatedReview && isGoogleReviewURLAvailable)
);

// This selector is used for CleverTap only
export const getTransactionInfoForCleverTap = createSelector(getStoreReviewInfoData, storeReviewInfoData => ({
  'order id': _get(storeReviewInfoData, 'orderId', ''),
  'store name': _get(storeReviewInfoData, 'storeName', ''),
  'store id': _get(storeReviewInfoData, 'storeId', ''),
  'shipping type': _get(storeReviewInfoData, 'shippingType', ''),
}));

export const getIsLoadDataRequestCompleted = createSelector(getStoreReviewLoadDataRequest, loadDataRequest =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadDataRequest.status)
);

export const getIsLoadDataRequestStatusFulfilled = createSelector(
  getStoreReviewLoadDataRequest,
  loadDataRequest => loadDataRequest.status === API_REQUEST_STATUS.FULFILLED
);

export const getShouldShowPageLoader = createSelector(
  getIsLoadDataRequestCompleted,
  isLoadDataRequestCompleted => !isLoadDataRequestCompleted
);

export const getIsInvalidReceiptNumberError = createSelector(getStoreReviewLoadDataRequest, loadDataRequest => {
  const errorCode = _get(loadDataRequest.error, 'code', '');
  return errorCode === STORE_REVIEW_ERROR_CODES.INVALID_RECEIPT_NUMBER;
});

export const getShouldShowUnsupportedError = createSelector(
  getIsStoreReviewSupportable,
  getIsInvalidReceiptNumberError,
  getIsLoadDataRequestStatusFulfilled,
  (isSupportable, isInvalidReceiptNumberError, isLoadDataRequestStatusFulfilled) =>
    (isLoadDataRequestStatusFulfilled && !isSupportable) || isInvalidReceiptNumberError
);

export const getOrderCreatedDate = createSelector(getStoreReviewInfoData, storeReviewInfoData => {
  const createdTime = _get(storeReviewInfoData, 'createdTime', '');
  const day = dayjs(createdTime);
  return isValidDate(day.toDate()) ? day.format('DD MMMM YYYY') : '';
});

export const getShouldShowBackButton = createSelector(
  getOffline,
  getIsWebview,
  (offline, isInWebview) => !offline || isInWebview
);
