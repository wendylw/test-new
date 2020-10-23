import { types } from '../../../ordering/redux/modules/app';

const initialState = {
  deliveryAddressList: [],
};

const reducer = (state = initialState, action) => {
  if (action.type === 'ORDERING/CUSTOMER/FETCH_ADDRESS_LIST_SUCCESS') {
    return {
      ...state,
      deliveryAddressList: action.response,
    };
  }

  return state;
};

export default reducer;
