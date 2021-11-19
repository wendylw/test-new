export const getCheckingInventoryPendingState = ({ cart }) => cart.common.cartInventory.status === 'pending';
