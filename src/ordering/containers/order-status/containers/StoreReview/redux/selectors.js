import { createSelector } from 'reselect';
import { getStoreRating, getStoreComment } from '../../../redux/selector';
import { STORE_REVIEW_COMMENT_CHAR_MAX } from '../constants';

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
