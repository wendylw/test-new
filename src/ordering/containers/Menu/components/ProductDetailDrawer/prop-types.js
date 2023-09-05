import PropTypes from 'prop-types';

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
