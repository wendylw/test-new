import PropTypes from 'prop-types';

export const selectorType = PropTypes.shape({
  multiple: PropTypes.bool,
  label: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.any),
  options: PropTypes.oneOfType([
    PropTypes.func, // options initializer
    PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
      origin: PropTypes.any,
    })),
  ]),
  onChange: PropTypes.func,
});

export const variationOnProductType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  variationType: PropTypes.oneOf(['SingleChoice', 'MultipleChoice']),
  optionValues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    value: PropTypes.string,
    priceDiff: PropTypes.number,
  })),
});

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
    cartItems: PropTypes.arrayOf(PropTypes.object), // @added
    hasSingleChoice: PropTypes.bool, // @added
    canDecreaseQuantity: PropTypes.bool, // @added
  })),
}));