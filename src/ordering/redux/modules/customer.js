import { combineReducers } from 'redux';
import i18next from 'i18next';
import Url from '../../../utils/url';
import config from '../../../config';
import { API_REQUEST } from '../../../redux/middlewares/api';
import {
  fetchDeliveryAddress,
  fetchDeliveryDetails,
  patchDeliveryDetails,
  updateDeliveryDetails,
} from '../../containers/Customer/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';
import _get from 'lodash/get';

const initialState = {
  deliveryDetails: {
    addressChange: false,
    addressId: '',
    addressName: '',
    username: '',
    phone: '',
    addressDetails: '',
    deliveryComments: '',
    deliveryToAddress: '',
    deliveryToLocation: {
      longitude: 0,
      latitude: 0,
    },
    deliveryAddressList: [],
  },
  customerError: {
    show: false,
    message: '',
    description: '',
    buttonText: '',
  },
};

// actions

export const types = {
  PUT_DELIVERY_DETAILS: 'ORDERING/CUSTOMER/PUT_DELIVERY_DETAILS',
  PUT_ADDRESS_CHANGE: 'ORDERING/CUSTOMER/PUT_ADDRESS_CHANGE',
  PUT_CUSTOMER_ERROR: 'ORDERING/CUSTOMER/PUT_CUSTOMER_ERROR',
  CLEAR_CUSTOMER_ERROR: 'ORDERING/CUSTOMER/CLEAR_CUSTOMER_ERROR',

  // Get Delivery Address List
  FETCH_ADDRESS_LIST_REQUEST: 'ORDERING/CUSTOMER/FETCH_ADDRESS_LIST_REQUEST',
  FETCH_ADDRESS_LIST_SUCCESS: 'ORDERING/CUSTOMER/FETCH_ADDRESS_LIST_SUCCESS',
  FETCH_ADDRESS_LIST_FAILURE: 'ORDERING/CUSTOMER/FETCH_ADDRESS_LIST_FAILURE',
};

export const actions = {
  initDeliveryDetails: shippingType => async (dispatch, getState) => {
    const deliveryDetails = await fetchDeliveryDetails();
    const localStoragePhone = localStorage.getItem('user.p') || '';

    const newDeliveryDetails = {
      ...deliveryDetails,
      phone: deliveryDetails.phone || _get(deliveryDetails, 'phone', localStoragePhone),
    };

    if (shippingType === 'delivery') {
      const newDeliveryDetails = await fetchDeliveryAddress();

      if (newDeliveryDetails) {
        newDeliveryDetails.deliveryToAddress = newDeliveryDetails.address;
        newDeliveryDetails.deliveryToLocation = {
          longitude: newDeliveryDetails.coords.lng,
          latitude: newDeliveryDetails.coords.lat,
        };
      }

      // if address chosen is different from address in session
      // then clean up the address details info
      if (deliveryDetails && deliveryDetails.deliveryToAddress !== newDeliveryDetails.deliveryToAddress) {
        newDeliveryDetails.addressDetails = '';
      }

      const { customer } = getState();
      const { deliveryDetails: nextDeliveryDetails } = customer;
      const { deliveryToAddress } = nextDeliveryDetails;
      const { longitude, latitude } = nextDeliveryDetails.deliveryToLocation;
      if (!deliveryToAddress && !longitude && !latitude) {
      } else {
        const addressChange =
          deliveryToAddress !== newDeliveryDetails.deliveryToAddress ||
          longitude !== newDeliveryDetails.deliveryToLocation.longitude ||
          latitude !== newDeliveryDetails.deliveryToLocation.latitude;
        dispatch({
          type: types.PUT_ADDRESS_CHANGE,
          addressChange,
        });
      }
    } else if (shippingType === 'pickup') {
      delete newDeliveryDetails.deliveryToAddress;
      delete newDeliveryDetails.addressDetails;
    }

    dispatch(actions.updateDeliveryDetails(newDeliveryDetails));
  },
  updateAddressChange: addressChange => dispatch => {
    dispatch({
      type: types.PUT_ADDRESS_CHANGE,
      addressChange,
    });
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
};

// reducers

const deliveryDetails = (state = initialState.deliveryDetails, action) => {
  if (action.type === types.PUT_DELIVERY_DETAILS) {
    return {
      ...state,
      ...action.fields,
    };
  } else if (action.type === types.PUT_ADDRESS_CHANGE) {
    return {
      ...state,
      addressChange: action.addressChange,
    };
  } else if (action.type === types.FETCH_ADDRESS_LIST_SUCCESS) {
    const deliveryAddressList = action.response || {};
    const findAvailableAddress = (deliveryAddressList || []).find(
      address =>
        address.availableStatus &&
        (address.addressName === state.addressName ||
          computeStraightDistance(address.location, state.deliveryToLocation) <= 500)
    );

    if (findAvailableAddress) {
      const {
        _id,
        addressName,
        addressDetails,
        comments: deliveryComments,
        deliveryTo: deliveryToAddress,
        location: deliveryToLocation,
      } = deliveryAddressList[0] || {};

      return {
        ...state,
        addressId: _id,
        deliveryAddressList,
        addressName,
        addressDetails,
        deliveryComments,
        deliveryToAddress,
        deliveryToLocation,
      };
    } else {
      return {
        ...state,
        deliveryAddressList,
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

export default combineReducers({
  deliveryDetails,
  customerError,
});

// selectors

export const getDeliveryDetails = state => state.customer.deliveryDetails;
export const getAddressChange = state => state.customer.deliveryDetails.addressChange;
export const getCustomerError = state => state.customer.customerError;
export const getDeliveryAddressList = state => state.customer.deliveryDetails.deliveryAddressList;
// export const isCheckoutDisabled = state => {}
