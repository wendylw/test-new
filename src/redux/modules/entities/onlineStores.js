const initialState = {};

const reducer = (state = initialState, action) => {
  const { responseGql } = action;

  if (responseGql) {
    const { onlineStoreInfo } = responseGql.data;

    if (!onlineStoreInfo) {
      return state;
    }

    // Only deal with response.data.onlineStoreInfo
    return { ...state, [onlineStoreInfo.id]: onlineStoreInfo };
  }
  return state;
};

export default reducer;

// selectors
