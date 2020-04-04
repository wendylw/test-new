import { combineReducers } from 'redux';
import {
  fetchDeliveryAddress,
  fetchDeliveryDetails,
  patchDeliveryDetails,
  updateDeliveryDetails,
} from '../../containers/Customer/utils';

// actions

export const types = {
  PUT_DELIVERY_DETAILS: 'ORDERING/CUSTOMER/PUT_DELIVERY_DETAILS',
};

export const actions = {
  initDeliveryDetails: shippingType => async (dispatch, getState) => {
    const deliveryDetails = await fetchDeliveryDetails();
    const phone = localStorage.getItem('user.p') || '';
    const newDeliveryDetails = {
      ...deliveryDetails,
      phone,
    };

    if (shippingType === 'delivery') {
      const deliveryAddress = await fetchDeliveryAddress();
      newDeliveryDetails.deliveryToAddress = deliveryAddress.address;
      newDeliveryDetails.deliveryToLocation = {
        longitude: deliveryAddress.coords.lng,
        latitude: deliveryAddress.coords.lat,
      };

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
  }
  return state;
};

export default combineReducers({
  deliveryDetails,
});

// selectors

export const getDeliveryDetails = state => state.customer.deliveryDetails;
// export const isCheckoutDisabled = state => {}
