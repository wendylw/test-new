import _get from 'lodash/get';
import { createSelector } from 'reselect';

export const getLoadCashbackHistoryListData = state => state.cashbackHistory.loadCashbackHistoryListRequest.data;

export const geLoadCashbackHistoryListStatus = state => state.cashbackHistory.loadCashbackHistoryListRequest.status;

export const geLoadCashbackHistoryListError = state => state.cashbackHistory.loadCashbackHistoryListRequest.error;

/**
 * Derived selectors
 */
export const getCashbackHistoryList = createSelector(getLoadCashbackHistoryListData, loadCashbackHistoryListData =>
  _get(loadCashbackHistoryListData, 'logs', [])
);
