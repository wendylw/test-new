const initialState = {};

const reducer = (state = initialState, action) => {
  const { code, message } = action;

  switch (code) {
    case '40004':
    case '40005':
    case 40008:
    case '40011':
      return { ...state, code, message };
    default:
      return state;
  }
};

export default reducer;

export const getPageError = state => state.entities.error;
