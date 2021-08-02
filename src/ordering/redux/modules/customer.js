import { combineReducers } from 'redux';
import i18next from 'i18next';
import Url from '../../../utils/url';
import config from '../../../config';
import { API_REQUEST } from '../../../redux/middlewares/api';
import {
  DeliveryDetailsStorageKey,
  fetchDeliveryAddress,
  fetchDeliveryDetails,
  patchDeliveryDetails,
  updateDeliveryDetails,
} from '../../containers/Customer/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';
import { getUserAddressList } from '../../../redux/modules/entities/users';
import Utils from '../../../utils/utils';

const initialState = {
  deliveryDetails: {
    addressId: '',
    addressName: '',
    username: '',
    phone: '',
    addressDetails: '',
    deliveryComments: '',
    deliveryToAddress: '',
    deliveryToCity: '',
    deliveryToLocation: {
      longitude: 0,
      latitude: 0,
    },
  },
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
  PUT_DELIVERY_DETAILS: 'ORDERING/CUSTOMER/PUT_DELIVERY_DETAILS',
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
  initDeliveryDetails: shippingType => async (dispatch, getState) => {
    const deliveryDetails = await fetchDeliveryDetails();
    const localStoragePhone = localStorage.getItem('user.p') || '';

    const newDeliveryDetails = {
      ...deliveryDetails,
      phone: (deliveryDetails && deliveryDetails.phone) || localStoragePhone,
    };

    if (shippingType === 'delivery') {
      const deliveryAddress = await fetchDeliveryAddress();

      if (deliveryAddress) {
        const { addressComponents } = deliveryAddress;

        newDeliveryDetails.deliveryToAddress = deliveryAddress.address;
        newDeliveryDetails.deliveryToLocation = {
          longitude: deliveryAddress.coords.lng,
          latitude: deliveryAddress.coords.lat,
        };
        newDeliveryDetails.deliveryToCity = addressComponents && addressComponents.city ? addressComponents.city : '';
      }

      // if address chosen is different from address in session
      // then clean up the address details info
      if (deliveryDetails && deliveryDetails.deliveryToAddress !== newDeliveryDetails.deliveryToAddress) {
        newDeliveryDetails.addressDetails = '';
      }
    } else if (shippingType === 'pickup') {
      delete newDeliveryDetails.deliveryToAddress;
      delete newDeliveryDetails.addressDetails;
    }

    dispatch(actions.updateDeliveryDetails(newDeliveryDetails));
  },
  updateDeliveryDetails: fields => async dispatch => {
    const result = await dispatch({
      type: types.PUT_DELIVERY_DETAILS,
      fields,
    });

    await updateDeliveryDetails(fields);

    return result;
  },
  patchDeliveryDetails: fields => async dispatch => {
    const result = await dispatch({
      type: types.PUT_DELIVERY_DETAILS,
      fields,
    });

    await patchDeliveryDetails(fields);

    return result;
  },
  fetchConsumerAddressList: ({ consumerId, storeId, preventUpdate }) => ({
    [API_REQUEST]: {
      types: [types.FETCH_ADDRESS_LIST_REQUEST, types.FETCH_ADDRESS_LIST_SUCCESS, types.FETCH_ADDRESS_LIST_FAILURE],
      ...Url.API_URLS.GET_ADDRESS_LIST(consumerId, storeId || config.storeId),
    },
    context: {
      preventUpdate,
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

const deliveryDetails = (state = initialState.deliveryDetails, action) => {
  if (action.type === types.PUT_DELIVERY_DETAILS) {
    return {
      ...state,
      ...action.fields,
    };
  } else if (action.type === types.FETCH_ADDRESS_LIST_SUCCESS) {
    const deliveryAddressList = action.response || {};
    const { preventUpdate } = action.context || {};
    const { longitude, latitude } = state.deliveryToLocation;
    let findAvailableAddress;

    // menu header show address name if native use saved address
    if (Utils.hasNativeSavedAddress()) {
      const addressIdFromNative = sessionStorage.getItem('addressIdFromNative');
      findAvailableAddress = (deliveryAddressList || []).find(
        address => address.availableStatus && address._id === addressIdFromNative
      );
    } else {
      findAvailableAddress = (deliveryAddressList || []).find(
        address =>
          address.availableStatus &&
          (address.addressName === state.addressName ||
            computeStraightDistance(
              {
                lng: address.location.longitude,
                lat: address.location.latitude,
              },
              {
                lng: longitude,
                lat: latitude,
              }
            ) <= 500)
      );
    }

    if (findAvailableAddress && !preventUpdate) {
      const {
        _id,
        addressName,
        addressDetails,
        comments: deliveryComments,
        deliveryTo: deliveryToAddress,
        location: deliveryToLocation,
        city: deliveryToCity,
      } = findAvailableAddress;

      // patch deliveryDetails to sessionStorage
      const deliveryDetails = JSON.parse(Utils.getSessionVariable(DeliveryDetailsStorageKey));
      Utils.setSessionVariable(
        DeliveryDetailsStorageKey,
        JSON.stringify({
          ...deliveryDetails,
          addressName,
          addressDetails,
          deliveryComments,
          deliveryToAddress,
          deliveryToLocation,
          deliveryToCity,
        })
      );

      return {
        ...state,
        addressId: _id,
        deliveryAddressList,
        addressName,
        addressDetails,
        deliveryComments,
        deliveryToAddress,
        deliveryToLocation,
        deliveryToCity,
      };
    }
  }
  return state;
};

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
  deliveryDetails,
  customerError,
  savedAddressInfo,
});

// selectors

export const getSavedAddressInfo = state => state.customer.savedAddressInfo;
export const getDeliveryDetails = state => state.customer.deliveryDetails;
export const getCustomerError = state => state.customer.customerError;
export const getDeliveryAddressList = state => {
  return getUserAddressList(state);
};
// export const isCheckoutDisabled = state => {}
