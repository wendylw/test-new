const initialState = {};

function transferOnlineStoreName(onlineStoreInfo) {
  // instead storeName with brandName
  const { storeName, beepBrandName } = onlineStoreInfo;
  const newOnlineStoreInfo = {
    ...onlineStoreInfo,
    storeName: beepBrandName || storeName,
  };
  return newOnlineStoreInfo;
}

const reducer = (state = initialState, action) => {
  const { responseGql } = action;

  if (responseGql) {
    const { onlineStoreInfo } = responseGql.data;

    if (!onlineStoreInfo) {
      return state;
    }

    // Only deal with response.data.onlineStoreInfo
    return { ...state, [onlineStoreInfo.id]: transferOnlineStoreName(onlineStoreInfo) };
  }
  return state;
};

export default reducer;

// selectors
