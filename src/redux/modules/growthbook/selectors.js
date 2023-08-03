import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../utils/constants';

export const getFeatureFlagInfo = state => state.growthbook.featureFlagInfo;

export const getFeatureFlagResults = createSelector([getFeatureFlagInfo], info => info.data);

export const getLoadFeatureFlagRequest = createSelector([getFeatureFlagInfo], info => info.loadDataRequest);

export const getFeatureKey = (_, fgKey) => fgKey;

/**
 * Select the feature flag result for the given feature key.
 *
 * @param state RootState
 * @param fgKey FEATURE_KEY
 * @returns boolean
 *
 * @example
 * const isFeatureEnabled = useSelector(state => getIsFeatureEnabled(state, FEATURE_KEY));
 */
export const getIsFeatureEnabled = createSelector([getFeatureFlagResults, getFeatureKey], (data, key) => data[key]);

export const getIsLoadFeatureRequestFulfilled = createSelector(
  getLoadFeatureFlagRequest,
  request => request.status === API_REQUEST_STATUS.FULFILLED
);
