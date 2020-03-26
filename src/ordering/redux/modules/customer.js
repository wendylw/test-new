import { combineReducers } from 'redux';
import { fetchDeliveryAddress, fetchDeliveryDetails, saveDeliveryDetails } from '../../containers/Customer/utils';

// actions

export const types = {
  PUT_DELIVERY_DETAILS: 'ORDERING/CUSTOMER/PUT_DELIVERY_DETAILS',
};

export const actions = {
  initDeliveryDetails: () => async (dispatch, getState) => {
    const deliveryDetails = await fetchDeliveryDetails();
    const deliveryToAddress = await fetchDeliveryAddress();
    const phone = localStorage.getItem('user.p') || '';

    const newDeliveryDetails = {
      ...deliveryDetails,
      phone,
      deliveryToAddress,
    };

    // if address chosen is different from address in session
    // then clean up the address details info
    if (deliveryDetails.deliveryToAddress !== deliveryToAddress) {
      newDeliveryDetails.addressDetails = '';
    }

    dispatch(actions.putDeliveryDetails(newDeliveryDetails));
  },
  putDeliveryDetails: fields => async (dispatch, getState) => {
    const result = await dispatch({
      type: types.PUT_DELIVERY_DETAILS,
      fields,
    });

    await saveDeliveryDetails(fields);

    return result;
  },
};

const initialState = {
  deliveryDetails: {
    username: '',
    phone: '',
    deliveryToAddress: '',
    addressDetails: '',
    deliveryComments: '',
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
