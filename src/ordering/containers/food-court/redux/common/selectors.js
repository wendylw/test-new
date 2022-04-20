import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';
import { AllFoodCourtStoreList } from './store-list';

export const getFoodCourtTableId = state => state.foodCourt.common.foodCourtTableId;

export const getFoodCourtId = state => state.foodCourt.common.foodCourtId;

export const getFoodCourtStoreList = state =>
  state.foodCourt.common.foodCourtStoreList.data.map(store => {
    const storeStaticData = AllFoodCourtStoreList.find(currentStore => currentStore.id === store.id);

    return {
      ...store,
      ...storeStaticData,
    };
  });

export const getFoodCourtStoreListStatus = state => state.foodCourt.common.foodCourtStoreList.status;
