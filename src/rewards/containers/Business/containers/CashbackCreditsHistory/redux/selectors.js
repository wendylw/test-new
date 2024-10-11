import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { getPrice } from '../../../../../../common/utils';
import { toLocaleDateString } from '../../../../../../utils/datetime-lib';
import {
  CASHBACK_CREDITS_HISTORY_TYPES,
  CASHBACK_CREDITS_HISTORY_REDUCE_TYPES,
  CASHBACK_CREDITS_HISTORY_LOG_I18N_KEYS,
  DATE_OPTIONS,
} from '../utils/constants';
import { getEarnRewardsNumber, getEarnCashbackPercentage } from '../../../utils';
import {
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../../../redux/modules/merchant/selectors';
import {
  getCustomizeRewardsSettingsCashbackRate,
  getCustomizeRewardsSettingsLoyaltyRate,
} from '../../../redux/common/selectors';

export const getIsCashbackPromptDrawerShow = state => state.business.cashbackCreditsHistory.isCashbackPromptDrawerShow;

export const getIsStoreCreditsPromptDrawerShow = state =>
  state.business.cashbackCreditsHistory.isStoreCreditsPromptDrawerShow;

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
  getMerchantCurrency,
  getMerchantLocale,
  (loadCashbackHistoryList, merchantCountry, merchantCurrency, merchantLocale) =>
    loadCashbackHistoryList.map((cashbackHistoryItem, index) => {
      const { type, eventTime, changeAmount = 0 } = cashbackHistoryItem || {};
      const historyItem = {
        id: `cashback-history-log-${index}`,
        nameI18nKey: CASHBACK_CREDITS_HISTORY_LOG_I18N_KEYS[type],
        logDateTime: toLocaleDateString(eventTime, merchantCountry, DATE_OPTIONS),
      };

      if (type === CASHBACK_CREDITS_HISTORY_TYPES.PENDING) {
        return historyItem;
      }

      const isReduce = changeAmount < 0 || (changeAmount === 0 && CASHBACK_CREDITS_HISTORY_REDUCE_TYPES.includes(type));
      const changeValue = `${isReduce ? '-' : '+'}${getPrice(Math.abs(changeAmount), {
        country: merchantCountry,
        currency: merchantCurrency,
        locale: merchantLocale,
      })}`;

      return {
        ...historyItem,
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
  getMerchantCurrency,
  getMerchantLocale,
  (loadStoreCreditsHistoryList, merchantCountry, merchantCurrency, merchantLocale) =>
    loadStoreCreditsHistoryList.map((storeCreditsHistoryItem, index) => {
      const { type, eventTime, changeAmount = 0 } = storeCreditsHistoryItem || {};
      const historyItem = {
        id: `store-credits-history-log-${index}`,
        nameI18nKey: CASHBACK_CREDITS_HISTORY_LOG_I18N_KEYS[type],
        logDateTime: toLocaleDateString(eventTime, merchantCountry, DATE_OPTIONS),
      };

      if (type === CASHBACK_CREDITS_HISTORY_TYPES.PENDING) {
        return historyItem;
      }

      const isReduce = changeAmount < 0 || (changeAmount === 0 && CASHBACK_CREDITS_HISTORY_REDUCE_TYPES.includes(type));
      const changeValue = `${isReduce ? '-' : '+'}${getPrice(Math.abs(changeAmount), {
        country: merchantCountry,
        currency: merchantCurrency,
        locale: merchantLocale,
      })}`;

      return {
        ...historyItem,
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

export const getIsCashbackStoreCreditsHistoryPageShow = createSelector(
  getIsLoadCashbackHistoryListCompleted,
  getIsLoadStoreCreditsHistoryListCompleted,
  (isLoadCashbackHistoryListCompleted, isLoadStoreCreditsHistoryListCompleted) =>
    isLoadCashbackHistoryListCompleted || isLoadStoreCreditsHistoryListCompleted
);

export const getEmptyPromptEarnCashbackPercentage = createSelector(
  getCustomizeRewardsSettingsCashbackRate,
  customizeRewardsSettingsCashbackRate => getEarnCashbackPercentage(customizeRewardsSettingsCashbackRate)
);

export const getEmptyPromptEarnStoreCreditsNumber = createSelector(
  getCustomizeRewardsSettingsLoyaltyRate,
  customizeRewardsSettingsLoyaltyRate => getEarnRewardsNumber(customizeRewardsSettingsLoyaltyRate, 10)
);

export const getEmptyPromptBaseSpent = createSelector(
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (merchantCountry, merchantCurrency, merchantLocale) =>
    getPrice(10, { country: merchantCountry, currency: merchantCurrency, locale: merchantLocale }).replace(/\.\d+/, '')
);
