const initialState = {};

function transferOrderName(order) {
  const { storeInfo } = order;
  const { name, beepBrandName, beepStoreNameLocationSuffix } = storeInfo || {};
  const newOrder = {
    ...order,
    storeInfo: {
      ...storeInfo,
      name: beepBrandName && beepStoreNameLocationSuffix ? `${beepBrandName}-${beepStoreNameLocationSuffix}` : name,
    },
  };
  return newOrder;
}

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;
    if (data.orders) {
      const [order] = data.orders;
      return { ...state, [order.orderId]: transferOrderName(order) };
    }

    if (data.order) {
      const { order } = data;
      return { ...state, [order.orderId]: transferOrderName(order) };
    }
  }
  if (action.response) {
    const order = action.response;
    return { ...state, [order.orderId]: transferOrderName(order) };
  }
  return state;
};

export default reducer;

// selectors

export const getAllOrders = state => state.entities.orders;

export const getOrderByOrderId = (state, orderId) => getAllOrders(state)[orderId];
