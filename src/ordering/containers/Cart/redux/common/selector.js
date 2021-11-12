export const getPendingTransactionIds = state => state.cart.pendingTransactionsIds;

export const getCheckingInventoryPendingState = ({ cart }) => cart.cartInventory.status === 'pending';
