import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Constants from '../../Constants';
import CartItems from './CartItems';
import ClearAll from './ClearAll';
import Aside from './Aside';

const { EDIT } = Constants.HOME_ASIDE_NAMES;

export class ProductsEditCartComponent extends Component {
  render() {
    const {
      active,
      shoppingCart,
      toggleAside,
    } = this.props;

    if (!shoppingCart) {
      return null;
    }

    const { count } = shoppingCart;

    return (
      <Aside
        active={active}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            toggleAside({ asideName: EDIT });
          }
        }}
      >
        <div className="cart-pane">
          <div className="cart-pane__operation border__botton-divider flex flex-middle flex-space-between">
            <h3 className="cart-pane__amount-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /></svg>
              <span className="cart-pane__amount-label text-middle gray-font-opacity">{`${count} Items`}</span>
            </h3>
            <ClearAll onClearedAll={() => toggleAside({ asideName: EDIT })} />
          </div>
          <div className="cart-pane__list">
            <CartItems />
          </div>
        </div>
      </Aside>
    )
  }
}

ProductsEditCartComponent.propTypes = {
  active: PropTypes.bool,
  toggleAside: PropTypes.func,
}

ProductsEditCartComponent.defaultProps = {
  active: false,
  toggleAside: () => { },
};

export default ProductsEditCartComponent
