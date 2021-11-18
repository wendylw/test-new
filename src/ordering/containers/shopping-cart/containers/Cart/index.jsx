import React from 'react';
import PayLater from './PayLater';
import PayFirst from './PayFirst';
import './OrderingCart.scss';

function Cart(props) {
  const { history } = props;
  // TODO
  return <div>{false ? <PayFirst history={history} /> : <PayLater history={history} />}</div>;
}

Cart.displayName = 'Cart';

export default Cart;
