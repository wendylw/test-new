import { getPlaceById, placesActionCreators } from './entities/places';
import { get } from '../../../utils/request';

const initialState = {
  error: '',
  currentPlaceId: '',
  user: {
    isLogin: false,
  },
};

const types = {
  CLEAR_ERROR: 'SITE/APP/CLEAR_ERROR',
  SET_CURRENT_PLACE_INFO: 'SITE/APP/SET_CURRENT_PLACE_INFO',
  PING_REQUEST: 'SITE/APP/PING_REQUEST',
  PING_SUCCESS: 'SITE/APP/PING_SUCCESS',
  PING_FAILURE: 'SITE/APP/PING_FAILURE',
};

// @actions

const queryPing = () => ({
  types: [types.PING_REQUEST, types.PING_SUCCESS, types.PING_FAILURE],
  requestPromise: get('/api/ping'),
});

const actions = {
  clearError: () => ({
    type: types.CLEAR_ERROR,
  }),

  // Important: this is an example to get response from dispatched requestPromise
  ping: () => async (dispatch, getState) => {
    const { response } = await dispatch(queryPing());
    console.log('[redux/app] [ping] response =>', response);
  },
  setCurrentPlaceInfo: placeInfo => (dispatch, getState) => {
    if (placeInfo) {
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

const userReducer = (state = initialState.user, action) => {
  switch (action.type) {
    case types.PING_SUCCESS:
      return { ...state, isLogin: action.response.login };
    default:
      return state;
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CLEAR_ERROR:
      return { ...state, error: null };
    case types.SET_CURRENT_PLACE_INFO:
      return { ...state, currentPlaceId: action.placeId };
    case types.PING_SUCCESS:
      return { ...state, user: userReducer(state.user, action) };
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