import { createSelector } from 'reselect';
import { toLocaleDateString } from '../../../../../../utils/datetime-lib';
import { CASHBACK_HISTORY_LOG_I18N_KEYS, DATE_OPTIONS } from '../utils/constants';
import { getMerchantCountry } from '../../../../../../redux/modules/merchant/selectors';

export const getIsEarnedCashbackPromptDrawerShow = state =>
  state.business.cashbackHistory.isEarnedCashbackPromptDrawerShow;

export const getCashbackHistoryListPage = state => state.business.cashbackHistory.page;

export const getCashbackHistoryListLimit = state => state.business.cashbackHistory.limit;

export const getIsCashbackHistoryListEnded = state => state.business.cashbackHistory.end;

export const getLoadCashbackHistoryListData = state =>
  state.business.cashbackHistory.loadCashbackHistoryListRequest.data || [];

export const getLoadCashbackHistoryListStatus = state =>
  state.business.cashbackHistory.loadCashbackHistoryListRequest.status;

export const getLoadCashbackHistoryListError = state =>
  state.business.cashbackHistory.loadCashbackHistoryListRequest.error;

/**
 * Derived selectors
 */
export const getCashbackHistoryList = createSelector(
  getLoadCashbackHistoryListData,
  getMerchantCountry,
  (getLoadCashbackHistoryList, merchantCountry) =>
    getLoadCashbackHistoryList.map(cashbackHistoryItem => {
      if (!cashbackHistoryItem) {
        return null;
      }

      const { id, type, eventTime, changeAmount } = cashbackHistoryItem || {};
      const isReduce = changeAmount < 0;
      const changeValue = `${isReduce ? '-' : '+'}${Math.abs(changeAmount)}`;

      return {
        id,
        nameI18nKey: CASHBACK_HISTORY_LOG_I18N_KEYS[type],
        logDateTime: toLocaleDateString(eventTime, merchantCountry, DATE_OPTIONS),
        changeValueText: changeValue,
        changeValue,
        isReduce,
      };
    })
);

export const getIsCashbackHistoryListEmpty = createSelector(
  getLoadCashbackHistoryListData,
  getIsCashbackHistoryListEnded,
  (loadCashbackHistoryListData, isCashbackHistoryListEnded) =>
    loadCashbackHistoryListData.length === 0 && isCashbackHistoryListEnded
);
