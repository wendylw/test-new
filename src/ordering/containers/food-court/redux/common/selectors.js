import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';
import { AllFoodCourtStoreList } from './store-list';

export const getFoodCourtTableId = state => state.foodCourt.common.foodCourtTableId;

export const getFoodCourtId = state => state.foodCourt.common.foodCourtId;

export const getFoodCourtStoreList = state =>
  AllFoodCourtStoreList.filter(store => state.foodCourt.common.foodCourtStoreList.data.includes(store.id));

export const getFoodCourtStoreListStatus = state => state.foodCourt.common.foodCourtStoreList.status;

export const getIsFoodCourtStoreListReady = createSelector(
  getFoodCourtStoreListStatus,
  foodCourtStoreListStatus => foodCourtStoreListStatus === API_REQUEST_STATUS.FULFILLED
);
