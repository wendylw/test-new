import Constants from '../../../../../utils/constants';

export const { DELIVERY_METHOD, PROMOTIONS_TYPES } = Constants;

export const SHIPPING_TYPES_MAPPING = {
  [DELIVERY_METHOD.PICKUP]: 5,
  [DELIVERY_METHOD.DELIVERY]: 6,
  [DELIVERY_METHOD.TAKE_AWAY]: 7,
  [DELIVERY_METHOD.DINE_IN]: 8,
};
