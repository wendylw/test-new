import { combineReducers } from 'redux';
import {
  fetchDeliveryAddress,
  fetchDeliveryDetails,
  patchDeliveryDetails,
  updateDeliveryDetails,
} from '../../containers/Customer/utils';
import _get from 'lodash/get';

// actions

export const types = {
  PUT_DELIVERY_DETAILS: 'ORDERING/CUSTOMER/PUT_DELIVERY_DETAILS',
  PUT_ADDRESS_CHANGE: 'ORDERING/CUSTOMER/PUT_ADDRESS_CHANGE',
};

export const actions = {
  initDeliveryDetails: shippingType => async (dispatch, getState) => {
    const deliveryDetails = await fetchDeliveryDetails();
    const localStoragePhone = localStorage.getItem('user.p') || '';

    const newDeliveryDetails = {
      ...deliveryDetails,
      phone: _get(deliveryDetails, 'phone', localStoragePhone),
    };

    if (shippingType === 'delivery') {
      const deliveryAddress = await fetchDeliveryAddress();

      if (deliveryAddress) {
        newDeliveryDetails.deliveryToAddress = deliveryAddress.address;
        newDeliveryDetails.deliveryToLocation = {
          longitude: deliveryAddress.coords.lng,
          latitude: deliveryAddress.coords.lat,
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
      const { longitude, latitude } = deliveryDetails.deliveryToLocation;
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
  updateDeliveryDetails: fields => async (dispatch, getState) => {
    const result = await dispatch({
      type: types.PUT_DELIVERY_DETAILS,
      fields,
    });

    await updateDeliveryDetails(fields);

    return result;
  },
  patchDeliveryDetails: fields => async (dispatch, getState) => {
    const result = await dispatch({
      type: types.PUT_DELIVERY_DETAILS,
      fields,
    });

    await patchDeliveryDetails(fields);

    return result;
  },
};

const initialState = {
  deliveryDetails: {
    addressChange: false,
    username: '',
    phone: '',
    addressDetails: '',
    deliveryComments: '',
    deliveryToAddress: '',
    deliveryToLocation: {
      longitude: 0,
      latitude: 0,
    },
  },
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
  }
  return state;
};

export default combineReducers({
  deliveryDetails,
});

// selectors

export const getDeliveryDetails = state => state.customer.deliveryDetails;
export const getAddressChange = state => state.customer.deliveryDetails.addressChange;
// export const isCheckoutDisabled = state => {}
