import React from 'react';
import { compose } from 'react-apollo';
import withShoppingCart from '../libs/withShoppingCart';

const PageFooterBar = ({ gqlShoppingCart }) => {
  const { shoppingCart } = gqlShoppingCart || {};

  if (!shoppingCart) {
    return null;
  }

  return (
    <div>
      <hr />
      Page Footer | 
      Cart Items: {shoppingCart.count}
    </div>
  );
};

export default compose(
  withShoppingCart,
)(PageFooterBar);
