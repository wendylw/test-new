import { getPlaceById, placesActionCreators } from './entities/places';

const initialState = {
  error: '',
  currentPlaceId: '',
};

const types = {
  CLEAR_ERROR: 'SITE/APP/CLEAR_ERROR',
  SET_CURRENT_PLACE_INFO: 'SITE/APP/SET_CURRENT_PLACE_INFO',
};

// @actions

const actions = {
  clearError: () => ({
    type: types.CLEAR_ERROR,
  }),
  initCurrentLocation: () => (dispatch, getState) => {
    // todo: can fetch address from sessionStorage here.
    dispatch(actions.setCurrentPlaceInfo(null));
  },
  setCurrentPlaceInfo: placeInfo => (dispatch, getState) => {
    if (placeInfo) {
      // todo: can save address into sessionStorage here.
      dispatch({
        type: types.SET_CURRENT_PLACE_INFO,
        placeId: placeInfo.placeId,
      });
      return dispatch(placesActionCreators.savePlace(placeInfo));
    }
    return null;
  },
};

// @reducers

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CLEAR_ERROR:
      return { ...state, error: null };
    case types.SET_CURRENT_PLACE_INFO:
      return { ...state, currentPlaceId: action.placeId };
    default:
      if (action.error) {
        return { ...state, error: action.error };
      }
      return state;
  }
};

export const appActionCreators = actions;
export default reducer;

// @selectors
export const getError = state => state.app.error;
export const getCurrentPlaceInfo = state => getPlaceById(state, state.app.currentPlaceId);
