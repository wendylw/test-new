import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import { getIsTNGMiniProgram } from '../../../../../redux/modules/app';
import {
  getStoreRating,
  getStoreComment,
  getStoreGoogleReviewURL,
  getStoreReviewInfoData,
} from '../../../redux/selector';
import { STORE_REVIEW_COMMENT_CHAR_MAX, STORE_REVIEW_HIGH_RATING } from '../constants';

export const getHasRated = createSelector(getStoreRating, rating => rating > 0);

export const getHasCommentCharLimitExceeded = createSelector(
  getStoreComment,
  comment => comment.length > STORE_REVIEW_COMMENT_CHAR_MAX
);

export const getShouldDisableSubmitButton = createSelector(
  getHasRated,
  getHasCommentCharLimitExceeded,
  (hasRated, hasCommentCharLimitExceeded) => !hasRated || hasCommentCharLimitExceeded
);

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
