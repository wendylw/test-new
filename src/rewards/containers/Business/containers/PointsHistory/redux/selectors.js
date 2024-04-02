import { createSelector } from 'reselect';
import { toLocaleDateString } from '../../../../../../utils/datetime-lib';
import { POINTS_HISTORY_LOG_I18N_KEYS, DATE_OPTIONS } from '../utils/constatns';
import { getMerchantCountry } from '../../../../../../redux/modules/merchant/selectors';

export const getIsEarnedPointsPromptDrawerShow = state => state.business.pointsHistory.isEarnedPointsPromptDrawerShow;

export const getPointsHistoryListPage = state => state.business.pointsHistory.page;

export const getPointsHistoryListLimit = state => state.business.pointsHistory.limit;

export const getIsPointsHistoryListEnded = state => state.business.pointsHistory.end;

export const getLoadPointsHistoryListData = state =>
  state.business.pointsHistory.loadPointsHistoryListRequest.data || [];

export const getLoadPointsHistoryListStatus = state => state.business.pointsHistory.loadPointsHistoryListRequest.status;

export const getLoadPointsHistoryListError = state => state.business.pointsHistory.loadPointsHistoryListRequest.error;

/**
 * Derived selectors
 */
export const getPointsHistoryList = createSelector(
  getLoadPointsHistoryListData,
  getMerchantCountry,
  (getLoadPointsHistoryList, merchantCountry) =>
    getLoadPointsHistoryList.map(pointsHistoryItem => {
      if (!pointsHistoryItem) {
        return null;
      }

      const { id, type, eventTime, changeAmount } = pointsHistoryItem || {};
      const isReduce = changeAmount < 0;

      return {
        id,
        nameI18nKey: POINTS_HISTORY_LOG_I18N_KEYS[type],
        logDateTime: toLocaleDateString(eventTime, merchantCountry, DATE_OPTIONS),
        changePoints: `${isReduce ? '-' : '+'}${Math.abs(changeAmount)}`,
        isReduce,
      };
    })
);

export const getIsPointsHistoryListEmpty = createSelector(
  getLoadPointsHistoryListData,
  getIsPointsHistoryListEnded,
  (loadPointsHistoryListData, isPointsHistoryListEnded) =>
    loadPointsHistoryListData.length === 0 && isPointsHistoryListEnded
);
