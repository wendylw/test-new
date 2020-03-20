import { combineReducers } from 'redux';

// actions

export const types = {
  PUT_DELIVERY_DETAILS: 'ORDERING/CUSTOMER/PUT_DELIVERY_DETAILS',
};

export const actions = {
  putDeliveryDetails: fields => (dispatch, getState) => {
    dispatch({
      type: types.PUT_DELIVERY_DETAILS,
      fields,
    });
    sessionStorage.setItem('user.deliveryDetails', JSON.stringify(getDeliveryDetails(getState())));
  },
};

const initialState = {
  deliveryDetails: {
    username: '',
    phone: localStorage.getItem('user.p') || '',
    deliverToAddress: '',
    addressDetails: '',
    deliveryComments: '',
  },
};

try {
  const deliveryDetailsCache = JSON.parse(sessionStorage.getItem('user.deliveryDetails'));
  if (deliveryDetailsCache) {
    initialState.deliveryDetails = deliveryDetailsCache;
  }
} catch (e) {
  console.error(e);
}

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
