const initialState = {};

const reducer = (state = initialState, action) => {
  const { code } = action;

  if (code === 404) {
    return {
      ...state,
      code,
      message: 'StoreNotFound',
    };
  } else if (code === 403) {
    return {
      ...state,
      code,
      message: 'DisabledBeepOrdering',
    };
  }

  return state;
};

export default reducer;

export const getError = state => state.entities.error;
