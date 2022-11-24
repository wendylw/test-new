import { createSelector } from '@reduxjs/toolkit';
import { AllFoodCourtStoreList } from './store-list';

export const getFoodCourtTableId = state => state.foodCourt.common.foodCourtTableId;

export const getFoodCourtId = state => state.foodCourt.common.foodCourtId;

export const getFoodCourtStores = state => state.foodCourt.common.foodCourtStoreList.data;

export const getFoodCourtStoreList = createSelector(getFoodCourtStores, foodCourtStoreListData =>
  foodCourtStoreListData.map(store => {
    const staticData = AllFoodCourtStoreList[store.id];
    const { isClosed } = store || {};
    const { unable } = staticData || {};

    return {
      unavailable: unable || isClosed,
      ...staticData,
      ...store,
    };
  })
);

export const getFoodCourtStoreListStatus = state => state.foodCourt.common.foodCourtStoreList.status;
