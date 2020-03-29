import { combineReducers } from 'redux';

const initialState = {
  error: '',
};

const types = {
  CLEAR_ERROR: 'site/app/CLEAR_ERROR',
};

// @actions

export const actions = {
  clearError: () => ({
    type: types.CLEAR_ERROR,
  }),
};

// @reducers

const error = (state = initialState.error, action) => {
  if (state && action.type === types.CLEAR_ERROR) {
    return null;
  }

  if (action.error) {
    return action.error;
  }

  return state;
};

export default combineReducers({
  error,
});

// @selectors
export const getError = state => state.app.error;
