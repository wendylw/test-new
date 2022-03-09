import PropTypes from 'prop-types';

const PromotionShape = PropTypes.shape({
  promotionCode: PropTypes.string,
  discountType: PropTypes.string,
  discountValue: PropTypes.number,
  formattedDiscountValue: PropTypes.string,
  maxDiscountAmount: PropTypes.number,
  formattedMaxDiscountAmount: PropTypes.string,
  minOrderAmount: PropTypes.number,
  formattedMinOrderAmount: PropTypes.string,
  requireFirstPurchase: PropTypes.bool,
  discountProductList: PropTypes.arrayOf(PropTypes.string),
  validDate: PropTypes.string,
  appliedSources: PropTypes.arrayOf(PropTypes.number),
});

export default PromotionShape;
