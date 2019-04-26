import PropTypes from 'prop-types';

export const shoppingCartType = PropTypes.shape({
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    productId: PropTypes.string,
    title: PropTypes.string,
    variationTexts: PropTypes.array,
    displayPrice: PropTypes.number,
    quantity: PropTypes.number,
    image: PropTypes.string,
  })),
});

export const onlineCategoryType = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  isEnabled: PropTypes.bool,
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    displayPrice: PropTypes.number,
    images: PropTypes.array,
    variations: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      variationType: PropTypes.string,
      optionValues: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        value: PropTypes.string,
      })),
    })),
  })),
}));

export const onlineCategoryMergedShoppingCartType = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  isEnabled: PropTypes.bool,
  cartQuantity: PropTypes.number, // @added
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    displayPrice: PropTypes.number,
    images: PropTypes.array,
    variations: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      variationType: PropTypes.string,
      optionValues: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        value: PropTypes.string,
      })),
    })),
    cartQuantity: PropTypes.number, // @added
    hasSingleChoice: PropTypes.bool, // @added
    canDecreaseQuantity: PropTypes.bool, // @added
  })),
}));