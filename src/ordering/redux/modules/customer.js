import { combineReducers } from 'redux';

const initialState = {
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
  // update and remove saved address info
  UPDATE_SAVED_ADDRESS_INFO: 'ORDERING/CUSTOMER/UPDATE_SAVED_ADDRESS_INFO',
  REMOVE_SAVED_ADDRESS_INFO: 'ORDERING/CUSTOMER/REMOVE_SAVED_ADDRESS_INFO',
};

export const actions = {
  updateSavedAddressInfo: fields => ({
    type: types.UPDATE_SAVED_ADDRESS_INFO,
    fields,
  }),
  removeSavedAddressInfo: () => ({
    type: types.REMOVE_SAVED_ADDRESS_INFO,
  }),
};

// reducers

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
  savedAddressInfo,
});

// selectors

export const getSavedAddressInfo = state => state.customer.savedAddressInfo;
