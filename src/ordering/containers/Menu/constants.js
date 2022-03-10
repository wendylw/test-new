import Constants from '../../../utils/constants';

export const PRODUCT_STOCK_STATUS = {
  NOT_TRACK_INVENTORY: 'notTrackInventory',
  IN_STOCK: 'inStock',
  LOW_STOCK: 'lowStock',
  OUT_OF_STOCK: 'outOfStock',
};

export const PRODUCT_VARIATION_TYPE = {
  SINGLE_CHOICE: 'SingleChoice',
  SIMPLE_MULTIPLE_CHOICE: 'SimpleMultipleChoice',
  QUANTITY_MULTIPLE_CHOICE: 'QuantityMultipleChoice',
};

export const PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE = {
  SELECT_X_OR_MORE: 'SelectXOrMore',
  SELECT_UP_TO_X: 'SelectUpToX',
  SELECT_X_TO_Y: 'SelectXToY',
  SELECT_X: 'SelectX',
};

export const PRODUCT_UNABLE_ADD_TO_CART_REASONS = {
  OUT_OF_STOCK: 'outOfStock',
  VARIATION_UNFULFILLED: 'variationUnFulfilled',
  EXCEEDED_QUANTITY_ON_HAND: 'exceededQuantityOnHand',
};

const { DELIVERY_METHOD, PROMOTIONS_TYPES } = Constants;

export const PROMOTIONS_SHIPPING_TYPES_MAPPING = {
  [DELIVERY_METHOD.PICKUP]: 5,
  [DELIVERY_METHOD.DELIVERY]: 6,
  [DELIVERY_METHOD.TAKE_AWAY]: 7,
  [DELIVERY_METHOD.DINE_IN]: 8,
};
export { PROMOTIONS_TYPES };
