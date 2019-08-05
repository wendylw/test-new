const initialState = {
};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;
    if (data.createOrder) {
      const [order] = data.createOrder.orders;
      return { ...state, [order.orderId]: order };
    } else if (data.order) {
      const { order } = data;
      return { ...state, [order.orderId]: order };
    }
  }
  return state;
}

export default reducer;

// selectors

export const getAllOrders = (state) => {
  return state.entities.orders;
}

export const getOrderByOrderId = (state, orderId) => {
  return getAllOrders(state)[orderId];
}
