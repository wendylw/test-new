import { isSourceBeepitCom } from '../ordering/containers/Home/utils';
import Utils from './utils';

export const BackPosition = Object.freeze({
  DELIVERY_TO: 'deliveryTo', // deliveryTo and pickupOn are actually two states of a same component on tech
  STORE_NAME: 'storeName',
});

const stateMetrics = [
  {
    isSite: true,
    isOpen: true,
    type: 'delivery',
    preOrder: true,
    /* output: */
    backPosition: BackPosition.DELIVERY_TO,
  },
  {
    isSite: true,
    isOpen: true,
    type: 'delivery',
    preOrder: false,
    /* output: */
    backPosition: BackPosition.DELIVERY_TO,
  },
  {
    isSite: true,
    isOpen: true,
    type: 'pickup',
    preOrder: true,
    /* output: */
    backPosition: BackPosition.DELIVERY_TO,
  },
  {
    isSite: true,
    isOpen: true,
    type: 'pickup',
    preOrder: false,
    /* output: */
    backPosition: BackPosition.STORE_NAME,
  },
  {
    isSite: true,
    isOpen: false,
    type: 'delivery',
    preOrder: true,
    /* output: */
    backPosition: BackPosition.DELIVERY_TO,
  },
  {
    isSite: true,
    isOpen: false,
    type: 'delivery',
    preOrder: false,
    /* output: */
    backPosition: BackPosition.STORE_NAME,
  },
  {
    isSite: true,
    isOpen: false,
    type: 'pickup',
    preOrder: true,
    /* output: */
    backPosition: BackPosition.DELIVERY_TO,
  },
  {
    isSite: true,
    isOpen: false,
    type: 'pickup',
    preOrder: false,
    /* output: */
    backPosition: BackPosition.STORE_NAME,
  },
];

export const showBackButton = ({
  isBeepitCom = isSourceBeepitCom(),
  orderType = Utils.getOrderTypeFromUrl(),
  isValidTimeToOrder,
  enablePreOrder,
  backPosition,
}) => {
  if (!Object.values(BackPosition).includes(backPosition)) {
    throw new Error('[backHelper] [showBackButton] backPosition value is invalid');
  }

  return !!stateMetrics.find(
    state =>
      state.isSite === isBeepitCom &&
      state.isOpen === isValidTimeToOrder &&
      state.type === orderType.toLowerCase() &&
      state.preOrder === Boolean(enablePreOrder) &&
      state.backPosition === backPosition
  );
};
