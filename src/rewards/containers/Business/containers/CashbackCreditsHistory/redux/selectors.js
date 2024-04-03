import { createSelector } from 'reselect';
import { toLocaleDateString } from '../../../../../../utils/datetime-lib';
import { CASHBACK_HISTORY_LOG_I18N_KEYS, DATE_OPTIONS } from '../utils/constants';
import { getMerchantCountry } from '../../../../../../redux/modules/merchant/selectors';

export const getIsUseCashbackPromptDrawerShow = state => state.business.cashbackHistory.isUseCashbackPromptDrawerShow;

export const getIsUseStoreCreditsPromptDrawerShow = state =>
  state.business.cashbackHistory.isUseStoreCreditsPromptDrawerShow;

export const getLoadCashbackCreditsHistoryListData = state =>
  state.business.cashbackHistory.loadCashbackCreditsHistoryListRequest.data || [];

export const getLoadCashbackCreditsHistoryListStatus = state =>
  state.business.cashbackHistory.loadCashbackCreditsHistoryListRequest.status;

export const getLoadCashbackCreditsHistoryListError = state =>
  state.business.cashbackHistory.loadCashbackCreditsHistoryListRequest.error;

export const getCashbackCreditsHistoryListPage = state =>
  state.business.cashbackHistory.loadCashbackCreditsHistoryListRequest.page;

export const getCashbackCreditsHistoryListLimit = state =>
  state.business.cashbackHistory.loadCashbackCreditsHistoryListRequest.limit;

export const getIsCashbackCreditsHistoryListEnded = state =>
  state.business.cashbackHistory.loadCashbackCreditsHistoryListRequest.end;

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

export const getIsCashbackCreditsHistoryListEmpty = createSelector(
  getLoadCashbackCreditsHistoryListData,
  getIsCashbackHistoryListEnded,
  (loadCashbackCreditsHistoryList, isCashbackHistoryListEnded) =>
    loadCashbackCreditsHistoryList.length === 0 && isCashbackHistoryListEnded
);
