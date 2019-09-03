import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CartList from './components/CartList';
import {
  IconLeftArrow,
  IconDelete,
  IconClose,
} from '../../../components/Icons';
import Utils from '../../../utils/utils';

import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as cartActions } from '../../redux/modules/cart';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { actions as homeActions, getShoppingCart, getCurrentProduct } from '../../redux/modules/home';

class Cart extends Component {
  state = {
    additionalComments: Utils.getAdditionalComments(),
  }

  componentDidMount() {
    const { homeActions } = this.props;
    homeActions.loadProductList();
  }

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value
    });

    Utils.setAdditionalComments(e.target.value);
  }

  handleClickBack = () => {
    this.props.history.push('/');
  }

  handleClearAll = () => {
    this.props.cartActions.clearAll().then(() => {
      this.props.history.push('/');
    });
  }

  renderAdditionalComments() {
    const { additionalComments } = this.state;

    return (
      <div className="cart__note flex flex-middle flex-space-between">
        <textarea
          rows="4"
          placeholder="Add a note to your order?"
          value={additionalComments || ''}
          onChange={this.handleChangeAdditionalComments.bind(this)}
        ></textarea>
        {
          additionalComments
            ? (
              <i
                className="cart__close-button"
                onClick={() => this.setState({ additionalComments: null })}
              >
                <IconClose />
              </i>
            )
            : null
        }
      </div>
    );
  }

  render() {
    const {
      cartSummary,
      shoppingCart,
    } = this.props;
    const { items } = shoppingCart || {};
    const { count } = cartSummary || {};

    if (!(cartSummary && items)) {
      return null;
    }

    return (
      <section className={`table-ordering__order` /* hide */}>
        <header className="header border__bottom-divider flex flex-middle flex-space-between"
          onClick={this.handleClickBack}
        >
          <figure className="header__image-container text-middle">
            <IconLeftArrow />
          </figure>
          <h2 className="header__title font-weight-bold text-middle">{`Order ${count || 0} Items`}</h2>
          <button className="warning__button" onClick={this.handleClearAll}>
            <IconDelete />
            <span className="warning__label text-middle">Clear All</span>
          </button>
        </header>
        <div className="list__container">
          <CartList shoppingCart={shoppingCart} />
          {this.renderAdditionalComments()}
        </div>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bold"
              onClick={this.handleClickBack}
            >Back</button>
          </div>
          <div className="footer-operation__item width-2-3">
            <Link
              className={`billing__link button button__fill button__block font-weight-bold ${items && items.length > 0 ? '' : 'disabled'}`}
              to="/payment"
            >Pay</Link>
          </div>
        </footer>
      </section>
    );
  }
}

export default connect(
  state => ({
    cartSummary: getCartSummary(state),
    shoppingCart: getShoppingCart(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    currentProduct: getCurrentProduct(state),
  }),
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  }),
)(Cart);
