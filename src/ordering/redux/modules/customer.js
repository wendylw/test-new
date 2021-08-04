import { combineReducers } from 'redux';
import i18next from 'i18next';
import Url from '../../../utils/url';
import config from '../../../config';
import { API_REQUEST } from '../../../redux/middlewares/api';
import Constants from '../../../utils/constants';
import { findAvailableAddressById, findNearbyAvailableAddress } from '../../containers/Customer/utils';
import { actions as appActions, getShippingType, getDeliveryDetails, getUserConsumerId, getStoreId } from './app';
import { getUserAddressList } from '../../../redux/modules/entities/users';
import Utils from '../../../utils/utils';

const { DELIVERY_METHOD } = Constants;

const initialState = {
  customerError: {
    show: false,
    message: '',
    description: '',
    buttonText: '',
  },
  savedAddressInfo: {
    id: '',
    type: '',
    name: '',
    address: '',
    details: '',
    comments: '',
    coords: {
      longitude: 0,
      latitude: 0,
    },
    addressComponents: {},
  },
};

// actions

export const types = {
  PUT_CUSTOMER_ERROR: 'ORDERING/CUSTOMER/PUT_CUSTOMER_ERROR',
  CLEAR_CUSTOMER_ERROR: 'ORDERING/CUSTOMER/CLEAR_CUSTOMER_ERROR',

  // Get Delivery Address List
  FETCH_ADDRESS_LIST_REQUEST: 'ORDERING/CUSTOMER/FETCH_ADDRESS_LIST_REQUEST',
  FETCH_ADDRESS_LIST_SUCCESS: 'ORDERING/CUSTOMER/FETCH_ADDRESS_LIST_SUCCESS',
  FETCH_ADDRESS_LIST_FAILURE: 'ORDERING/CUSTOMER/FETCH_ADDRESS_LIST_FAILURE',

  // update and remove saved address info
  UPDATE_SAVED_ADDRESS_INFO: 'ORDERING/CUSTOMER/UPDATE_SAVED_ADDRESS_INFO',
  REMOVE_SAVED_ADDRESS_INFO: 'ORDERING/CUSTOMER/REMOVE_SAVED_ADDRESS_INFO',
};

export const actions = {
  selectAvailableAddress: () => async (dispatch, getState) => {
    const state = getState();
    const deliveryDetails = getDeliveryDetails(state);
    const shippingType = getShippingType(state);

    if (shippingType !== DELIVERY_METHOD.DELIVERY) {
      return;
    }

    if (deliveryDetails.addressId) {
      return;
    }

    const consumerId = getUserConsumerId(state);
    const storeId = getStoreId(state);
    const deliveryCoords = Utils.getDeliveryCoords();

    await dispatch(actions.fetchConsumerAddressList({ consumerId, storeId }));

    const addressList = getDeliveryAddressList(getState());

    const addressIdFromNative = sessionStorage.getItem('addressIdFromNative');

    const availableAddress = (() => {
      if (addressIdFromNative) {
        return findAvailableAddressById(addressList, addressIdFromNative);
      }

      if (deliveryCoords) {
        return findNearbyAvailableAddress(addressList, {
          longitude: deliveryCoords.lng,
          latitude: deliveryCoords.lat,
        });
      }

      return null;
    })();

    if (!availableAddress) {
      return;
    }

    const {
      _id,
      addressName,
      addressDetails,
      comments: deliveryComments,
      deliveryTo: deliveryToAddress,
      location: deliveryToLocation,
      city: deliveryToCity,
    } = availableAddress;

    appActions.updateDeliveryDetails({
      addressId: _id,
      addressName,
      addressDetails,
      deliveryComments,
      deliveryToAddress,
      deliveryToLocation,
      deliveryToCity,
    });
  },
  fetchConsumerAddressList: ({ consumerId, storeId }) => ({
    [API_REQUEST]: {
      types: [types.FETCH_ADDRESS_LIST_REQUEST, types.FETCH_ADDRESS_LIST_SUCCESS, types.FETCH_ADDRESS_LIST_FAILURE],
      ...Url.API_URLS.GET_ADDRESS_LIST(consumerId, storeId || config.storeId),
    },
  }),
  setError: error => ({
    type: types.PUT_CUSTOMER_ERROR,
    error,
  }),
  clearError: () => ({
    type: types.CLEAR_CUSTOMER_ERROR,
  }),
  updateSavedAddressInfo: fields => ({
    type: types.UPDATE_SAVED_ADDRESS_INFO,
    fields,
  }),
  removeSavedAddressInfo: () => ({
    type: types.REMOVE_SAVED_ADDRESS_INFO,
  }),
};

// reducers
const customerError = (state = initialState.customerError, action) => {
  if (action.type === types.CLEAR_CUSTOMER_ERROR) {
    return {
      ...state,
      show: false,
      message: '',
      description: '',
      buttonText: '',
    };
  }

  if (action.type === types.PUT_CUSTOMER_ERROR) {
    return {
      ...state,
      show: action.error.showModal,
      message: i18next.t(action.error.message),
      description: i18next.t(action.error.description),
      buttonText: i18next.t(action.error.buttonText),
    };
  }

  return state;
};

const savedAddressInfo = (state = initialState.savedAddressInfo, action) => {
  if (action.type === types.UPDATE_SAVED_ADDRESS_INFO) {
    const { fields } = action;
    return {
      ...state,
      ...fields,
    };
  }

  if (action.type === types.REMOVE_SAVED_ADDRESS_INFO) {
    return {
      ...initialState.savedAddressInfo,
    };
  }

  return state;
};

export default combineReducers({
  customerError,
  savedAddressInfo,
});

// selectors

export const getSavedAddressInfo = state => state.customer.savedAddressInfo;
export const getCustomerError = state => state.customer.customerError;
export const getDeliveryAddressList = state => {
  return getUserAddressList(state);
};
// export const isCheckoutDisabled = state => {}
