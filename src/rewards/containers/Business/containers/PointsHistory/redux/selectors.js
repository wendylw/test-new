import i18next from 'i18next';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { toLocaleDateString } from '../../../../../../utils/datetime-lib';
import { POINTS_HISTORY_LOG_I18N_KEYS, DATE_OPTIONS } from '../utils/constants';
import { getMerchantCountry } from '../../../../../../redux/modules/merchant/selectors';

export const getIsEarnedPointsPromptDrawerShow = state => state.business.pointsHistory.isEarnedPointsPromptDrawerShow;

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
      const { id, type, eventTime, changeAmount } = pointsHistoryItem || {};
      const isReduce = changeAmount < 0;
      const changeValue = `${isReduce ? '-' : '+'}${Math.abs(changeAmount)}`;

      return {
        id,
        nameI18nKey: POINTS_HISTORY_LOG_I18N_KEYS[type],
        logDateTime: toLocaleDateString(eventTime, merchantCountry, DATE_OPTIONS),
        changeValueText: i18next.t('Rewards:ChangePointsText', { changeValue }),
        changeValue,
        isReduce,
      };
    })
);

export const getIsLoadPointsHistoryListCompleted = createSelector(
  getLoadPointsHistoryListStatus,
  loadPointsHistoryListStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadPointsHistoryListStatus)
);

export const getIsPointsHistoryListEmpty = createSelector(
  getLoadPointsHistoryListData,
  getIsLoadPointsHistoryListCompleted,
  (loadPointsHistoryListData, isLoadPointsHistoryListCompleted) =>
    loadPointsHistoryListData.length === 0 && isLoadPointsHistoryListCompleted
);
