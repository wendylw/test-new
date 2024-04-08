import { createSelector } from 'reselect';
import { toLocaleDateString } from '../../../../../../utils/datetime-lib';
import { CASHBACK_HISTORY_LOG_I18N_KEYS, DATE_OPTIONS } from '../utils/constants';
import { getMerchantCountry } from '../../../../../../redux/modules/merchant/selectors';

export const getIsUseCashbackPromptDrawerShow = state =>
  state.business.cashbackCreditsHistory.isUseCashbackPromptDrawerShow;

export const getIsUseStoreCreditsPromptDrawerShow = state =>
  state.business.cashbackCreditsHistory.isUseStoreCreditsPromptDrawerShow;

export const getLoadCashbackCreditsHistoryListData = state =>
  state.business.cashbackCreditsHistory.loadCashbackCreditsHistoryListRequest.data || [];

export const getLoadCashbackCreditsHistoryListStatus = state =>
  state.business.cashbackCreditsHistory.loadCashbackCreditsHistoryListRequest.status;

export const getLoadCashbackCreditsHistoryListError = state =>
  state.business.cashbackCreditsHistory.loadCashbackCreditsHistoryListRequest.error;

/**
 * Derived selectors
 */
export const getCashbackCreditsHistoryList = createSelector(
  getLoadCashbackCreditsHistoryListData,
  getMerchantCountry,
  (loadCashbackCreditsHistoryList, merchantCountry) =>
    loadCashbackCreditsHistoryList.map(cashbackCreditsHistoryItem => {
      const { id, type, eventTime, changeAmount } = cashbackCreditsHistoryItem || {};
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

export const getIsLoadCashbackCreditsHistoryListCompleted = createSelector(
  getLoadCashbackCreditsHistoryListStatus,
  loadCashbackCreditsHistoryListStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadCashbackCreditsHistoryListStatus)
);

export const getIsCashbackCreditsHistoryListEmpty = createSelector(
  getLoadCashbackCreditsHistoryListData,
  getIsLoadCashbackCreditsHistoryListCompleted,
  (loadCashbackCreditsHistoryList, isLoadCashbackCreditsHistoryListCompleted) =>
    loadCashbackCreditsHistoryList.length === 0 && isLoadCashbackCreditsHistoryListCompleted
);
