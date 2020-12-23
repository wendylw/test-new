import { LOCATION_AND_DATE } from '../types';
import _get from 'lodash/get';
import Constants from '../../../utils/constants';
import { findNearlyStore, getBusinessDateTime } from '../../../utils/order-utils';
import { getStoreById, getAllStores } from '../../../redux/modules/entities/stores';
import { getBusinessUTCOffset } from './app';
import { actions as homeActions } from './home';

import { createSelector } from 'reselect';

const { DELIVERY_METHOD } = Constants;

const initialState = {
  currentDate: null, // dayjs object
  deliveryType: null,
  storeId: null,
  deliveryAddress: '',
  deliveryDate: null,
  deliveryTime: null,
};

export const actions = {
  initialState: ({ deliveryType, storeId, deliveryAddress }) => async (dispatch, getState) => {
    const isDelivery = deliveryType === DELIVERY_METHOD.DELIVERY;
    const businessUTCOffset = getBusinessUTCOffset(getState());
    const payload = {
      currentDate: getBusinessDateTime(businessUTCOffset),
      deliveryType,
      storeId,
      deliveryAddress,
    };

    await dispatch(homeActions.loadCoreStores());

    // find nearly store by delivery address
    if (!storeId && isDelivery && deliveryAddress && deliveryAddress.coords) {
      const state = getState();
      const stores = getAllStores(state);
      const store = findNearlyStore(stores, deliveryAddress.coords);
      if (store) {
        payload.storeId = store.id;
      }
    }

    return dispatch({
      type: LOCATION_AND_DATE.INITIAL_STATE,
      payload,
    });
  },

  deliveryTypeChanged: deliveryType => ({
    type: LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED,
    payload: deliveryType,
  }),

  storeChanged: storeId => ({
    type: LOCATION_AND_DATE.STORE_CHANGED,
    payload: storeId,
  }),

  deliveryAddressChanged: deliveryAddress => ({
    type: LOCATION_AND_DATE.DELIVERY_ADDRESS_CHANGED,
    payload: deliveryAddress,
  }),

  deliveryDateChanged: deliveryDate => ({
    type: LOCATION_AND_DATE.DELIVERY_DATE_CHANGED,
    payload: deliveryDate,
  }),

  deliveryTimeChanged: deliveryTime => ({
    type: LOCATION_AND_DATE.DELIVERY_TIME_CHANGED,
    payload: deliveryTime,
  }),

  currentDateChange: currentDate => ({
    type: LOCATION_AND_DATE.CURRENT_DATE_UPDATED,
    payload: currentDate,
  }),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOCATION_AND_DATE.INITIAL_STATE:
      const { currentDate, deliveryType, storeId, deliveryAddress, disableSelectDeliveryType } = action.payload;

      return {
        ...state,
        currentDate,
        deliveryType,
        storeId,
        deliveryAddress,
        disableSelectDeliveryType,
      };
    case LOCATION_AND_DATE.DELIVERY_TYPE_CHANGED:
      return {
        ...state,
        deliveryType: action.payload,
      };
    case LOCATION_AND_DATE.STORE_CHANGED:
      return {
        ...state,
        storeId: action.payload,
      };
    case LOCATION_AND_DATE.DELIVERY_ADDRESS_CHANGED:
      return {
        ...state,
        deliveryAddress: action.payload,
      };
    case LOCATION_AND_DATE.DELIVERY_DATE_CHANGED:
      return {
        ...state,
        deliveryDate: action.payload,
      };
    case LOCATION_AND_DATE.DELIVERY_TIME_CHANGED:
      return {
        ...state,
        deliveryTime: action.payload,
      };
    case LOCATION_AND_DATE.CURRENT_DATE_UPDATED:
      return {
        ...state,
        currentDate: action.payload,
      };
    default:
      return state;
  }
};

export const getDeliveryType = state => {
  return _get(state.locationAndDate, 'deliveryType', null);
};

export const getStoreId = state => {
  return _get(state.locationAndDate, 'storeId', null);
};

export const getStore = state => {
  const storeId = getStoreId(state);
  return getStoreById(state, storeId);
};

export const getDeliveryAddress = state => {
  return _get(state.locationAndDate, 'deliveryAddress', '');
};

export const getDeliveryDate = state => {
  return _get(state.locationAndDate, 'deliveryDate', null);
};

export const getDeliveryTime = state => {
  return _get(state.locationAndDate, 'deliveryTime', null);
};

export const getCurrentDate = state => {
  const businessUTCOffset = getBusinessUTCOffset(state);
  return _get(state.locationAndDate, 'currentDate', getBusinessDateTime(businessUTCOffset));
};

export default reducer;
