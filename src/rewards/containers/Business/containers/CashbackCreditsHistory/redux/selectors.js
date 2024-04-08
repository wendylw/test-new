import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { toLocaleDateString } from '../../../../../../utils/datetime-lib';
import { CASHBACK_HISTORY_LOG_I18N_KEYS, DATE_OPTIONS } from '../utils/constants';
import { getMerchantCountry } from '../../../../../../redux/modules/merchant/selectors';

export const getIsUseCashbackPromptDrawerShow = state =>
  state.business.cashbackCreditsHistory.isUseCashbackPromptDrawerShow;

export const getIsUseStoreCreditsPromptDrawerShow = state =>
  state.business.cashbackCreditsHistory.isUseStoreCreditsPromptDrawerShow;

export const getLoadCashbackHistoryListData = state =>
  state.business.cashbackCreditsHistory.loadCashbackHistoryListRequest.data || [];

export const getLoadCashbackHistoryListStatus = state =>
  state.business.cashbackCreditsHistory.loadCashbackHistoryListRequest.status;

export const getLoadCashbackHistoryListError = state =>
  state.business.cashbackCreditsHistory.loadCashbackHistoryListRequest.error;

export const getLoadStoreCreditsHistoryListData = state =>
  state.business.cashbackCreditsHistory.loadStoreCreditsHistoryListRequest.data || [];

export const getLoadStoreCreditsHistoryListStatus = state =>
  state.business.cashbackCreditsHistory.loadStoreCreditsHistoryListRequest.status;

export const getLoadStoreCreditsHistoryListError = state =>
  state.business.cashbackCreditsHistory.loadStoreCreditsHistoryListRequest.error;

/**
 * Derived selectors
 */
export const getCashbackHistoryList = createSelector(
  getLoadCashbackHistoryListData,
  getMerchantCountry,
  (loadCashbackHistoryList, merchantCountry) =>
    loadCashbackHistoryList.map(cashbackCreditsHistoryItem => {
      const { id, eventType, eventTime, changeAmount } = cashbackCreditsHistoryItem || {};
      const isReduce = changeAmount < 0;
      const changeValue = `${isReduce ? '-' : '+'}${Math.abs(changeAmount)}`;

      return {
        id,
        nameI18nKey: CASHBACK_HISTORY_LOG_I18N_KEYS[eventType],
        logDateTime: toLocaleDateString(eventTime, merchantCountry, DATE_OPTIONS),
        changeValueText: changeValue,
        changeValue,
        isReduce,
      };
    })
);

export const getIsLoadCashbackHistoryListCompleted = createSelector(
  getLoadCashbackHistoryListStatus,
  loadCashbackHistoryListStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadCashbackHistoryListStatus)
);

export const getIsCashbackHistoryListEmpty = createSelector(
  getLoadCashbackHistoryListData,
  getIsLoadCashbackHistoryListCompleted,
  (loadCashbackHistoryList, isLoadCashbackHistoryListCompleted) =>
    loadCashbackHistoryList.length === 0 && isLoadCashbackHistoryListCompleted
);

export const getStoreCreditsHistoryList = createSelector(
  getLoadStoreCreditsHistoryListData,
  getMerchantCountry,
  (loadStoreCreditsHistoryList, merchantCountry) =>
    loadStoreCreditsHistoryList.map(cashbackCreditsHistoryItem => {
      const { id, eventType, eventTime, changeAmount } = cashbackCreditsHistoryItem || {};
      const isReduce = changeAmount < 0;
      const changeValue = `${isReduce ? '-' : '+'}${Math.abs(changeAmount)}`;

      return {
        id,
        nameI18nKey: CASHBACK_HISTORY_LOG_I18N_KEYS[eventType],
        logDateTime: toLocaleDateString(eventTime, merchantCountry, DATE_OPTIONS),
        changeValueText: changeValue,
        changeValue,
        isReduce,
      };
    })
);

export const getIsLoadStoreCreditsHistoryListCompleted = createSelector(
  getLoadStoreCreditsHistoryListStatus,
  loadStoreCreditsHistoryListStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadStoreCreditsHistoryListStatus)
);

export const getIsStoreCreditsHistoryListEmpty = createSelector(
  getLoadStoreCreditsHistoryListData,
  getIsLoadStoreCreditsHistoryListCompleted,
  (loadStoreCreditsHistoryList, isLoadStoreCreditsHistoryListCompleted) =>
    loadStoreCreditsHistoryList.length === 0 && isLoadStoreCreditsHistoryListCompleted
);
