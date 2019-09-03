import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IconCartII,
  IconDelete,
} from '../../../../../components/Icons';
import CartList from '../../../Cart/components/CartList';


import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as cartActions } from '../../../../redux/modules/cart';
import { getCartSummary } from '../../../../../redux/modules/entities/carts';
import { actions as homeActions } from '../../../../redux/modules/home';

class MiniCartListModal extends Component {
  handleClearAll = async () => {
    await this.props.cartActions.clearAll();
  }

  handleHideCart(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  render() {
    const {
      show,
      cartSummary,
    } = this.props;
    const { count } = cartSummary || {};
    const className = ['aside'];

    if (show) {
      className.push('active');
    }

    return (
      <aside className={className.join(' ')} onClick={(e) => this.handleHideCart(e)}>
        <div className="cart-pane">
          <div className="cart-pane__operation border__botton-divider flex flex-middle flex-space-between">
            <h3 className="cart-pane__amount-container">
              <IconCartII />
              <span className="cart-pane__amount-label text-middle gray-font-opacity">{`${count || 0} Items`}</span>
            </h3>
            <button className="warning__button" onClick={this.handleClearAll.bind(this)}>
              <IconDelete />
              <span className="warning__label text-middle">Clear All</span>
            </button>
          </div>
          <div className="cart-pane__list">
            <CartList />
          </div>
        </div>
      </aside>
    );
  }
}

MiniCartListModal.propTypes = {
  show: PropTypes.bool,
  onToggle: PropTypes.func,
};

MiniCartListModal.defaultProps = {
  show: false,
  onToggle: () => { }
};

export default connect(
  state => {
    return {
      cartSummary: getCartSummary(state),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  }),
)(MiniCartListModal);
