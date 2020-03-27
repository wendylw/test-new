const initialState = {};

const reducer = (state = initialState, action) => {
  const { code, message } = action;

  switch (code) {
    case '40004':
    case '40005':
      return { ...state, code, message };
    default:
      return state;
  }
};

export default reducer;

export const getPageError = state => state.entities.error;
