import _get from 'lodash/get';
import { createSelector } from 'reselect';

export const getLoadUniquePromosAvailableCountData = state => state.rewards.loadUniquePromosAvailableCountRequest.data;

export const getLoadUniquePromosAvailableCountStatus = state =>
  state.rewards.loadUniquePromosAvailableCountRequest.status;

export const getLoadUniquePromosAvailableCountError = state =>
  state.rewards.loadUniquePromosAvailableCountRequest.error;

export const getUniquePromosAvailableCount = createSelector(
  getLoadUniquePromosAvailableCountData,
  loadUniquePromosAvailableCountData => _get(loadUniquePromosAvailableCountData, 'availableCount', 0)
);
