import { APP_TYPES } from '../../../cashback/redux/types';

const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;

    if (data.business && data.business.country) {
      const { business } = data;
      return { ...state, [business.name]: business, loaded: true };
    }
  } else if (action.type === APP_TYPES.FETCH_BUSINESS_SUCCESS) {
    const { name } = action.response;

    return { ...state, [name]: action.response };
  } else if (action.type === APP_TYPES.FETCH_COREBUSINESS_FAILURE) {
    return { ...state, loaded: false };
  }

  return state;
};

export default reducer;

export const getAllBusinesses = state => state.entities.businesses;

export const getBusinessByName = (state, businessName) => getAllBusinesses(state)[businessName];

export const getBusinessIsLoaded = state => state.entities.businesses.loaded;
