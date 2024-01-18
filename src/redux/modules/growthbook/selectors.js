import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../utils/constants';
import { DEFAULT_FEATURE_FLAG_RESULTS } from './constants';

export const getFeatureFlagInfo = state => state.growthbook.featureFlagInfo;

export const getFeatureFlagResults = createSelector([getFeatureFlagInfo], info => info.data);

export const getLoadFeatureFlagRequest = createSelector([getFeatureFlagInfo], info => info.loadDataRequest);

export const getFeatureKey = (_, fgKey) => fgKey;

/**
 * Select the feature flag result for the given feature key.
 *
 * @param state RootState
 * @param fgKey FEATURE_KEY
 * @returns any
 *
 * @example
 * const featureFlagResult = useSelector(state => getFeatureFlagResult(state, FEATURE_KEY));
 */
export const getFeatureFlagResult = createSelector([getFeatureFlagResults, getFeatureKey], (data, key) =>
  _get(data, key, DEFAULT_FEATURE_FLAG_RESULTS[key])
);

export const getIsLoadFeatureRequestFulfilled = createSelector(
  getLoadFeatureFlagRequest,
  request => request.status === API_REQUEST_STATUS.FULFILLED
);
