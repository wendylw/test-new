const initialState = {};

const reducer = (state = initialState, action) => {
  const { code, message } = action;

  if (code === 40005) {
    return {
      ...state,
      code,
      message,
    };
  } else if (code === 40004) {
    return {
      ...state,
      code,
      message,
    };
  }

  return state;
};

export default reducer;

export const getError = state => state.entities.error;
