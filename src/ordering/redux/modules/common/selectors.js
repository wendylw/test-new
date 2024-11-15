import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getStoreInfoForCleverTap, getUserName } from '../app';

export const getLoadUniquePromosAvailableCountData = state => state.common.loadUniquePromosAvailableCountRequest.data;

export const getLoadUniquePromosAvailableCountStatus = state =>
  state.rewards.loadUniquePromosAvailableCountRequest.status;

export const getLoadUniquePromosAvailableCountError = state =>
  state.rewards.loadUniquePromosAvailableCountRequest.error;

export const getUniquePromosAvailableCount = createSelector(
  getLoadUniquePromosAvailableCountData,
  loadUniquePromosAvailableCountData => _get(loadUniquePromosAvailableCountData, 'availableCount', 0)
);

export const getIsLoadUniquePromosAvailableCountFulfilled = createSelector(
  getLoadUniquePromosAvailableCountStatus,
  loadUniquePromosAvailableCountStatus => loadUniquePromosAvailableCountStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoadUniquePromosAvailableCountCompleted = createSelector(
  getLoadUniquePromosAvailableCountStatus,
  loadUniquePromosAvailableCountStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadUniquePromosAvailableCountStatus)
);

export const getLoadUniquePromosAvailableCountCleverTap = createSelector(
  getUniquePromosAvailableCount,
  getStoreInfoForCleverTap,
  getUserName,
  (uniquePromosAvailableCount, storeInfoForCleverTap, userName) => ({
    ...storeInfoForCleverTap,
    'account name': userName,
    'promo indicator display': uniquePromosAvailableCount > 0,
    'promo indicator number': uniquePromosAvailableCount,
  })
);
