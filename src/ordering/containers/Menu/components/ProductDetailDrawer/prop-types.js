import PropTypes from 'prop-types';
import { PRODUCT_STOCK_STATUS } from '../../../../../common/utils/constants';

export const VariationOptionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  formattedPriceDiff: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  quantity: PropTypes.number,
  isAbleToDecreaseQuantity: PropTypes.bool,
  isAbleToIncreaseQuantity: PropTypes.bool,
  available: PropTypes.bool.isRequired,
});

export const selectionAmountLimit = PropTypes.shape({
  visible: PropTypes.bool,
  type: PropTypes.oneOf(['SelectXOrMore', 'SelectUpToX', 'SelectXToY', 'SelectX']),
  max: PropTypes.number,
  min: PropTypes.number,
});

export const VariationShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['SingleChoice', 'SimpleMultipleChoice', 'QuantityMultipleChoice']).isRequired,
  selectionAmountLimit,
  selectedQuantity: PropTypes.number.isRequired,
  formattedPriceDiff: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(VariationOptionShape),
});

export const ProductShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  formattedDisplayPrice: PropTypes.string.isRequired,
  formattedOriginalDisplayPrice: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  formattedTotalPrice: PropTypes.string.isRequired,
  stockStatus: PropTypes.oneOf([
    PRODUCT_STOCK_STATUS.IN_STOCK,
    PRODUCT_STOCK_STATUS.LOW_STOCK,
    PRODUCT_STOCK_STATUS.OUT_OF_STOCK,
  ]).isRequired,
  quantityOnHand: PropTypes.number.isRequired,
  isBestSeller: PropTypes.bool.isRequired,
  isAbleToDecreaseQuantity: PropTypes.bool.isRequired,
  isAbleToIncreaseQuantity: PropTypes.bool.isRequired,
  variations: PropTypes.arrayOf(VariationShape).isRequired,
});
