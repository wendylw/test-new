import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Billing from '../../components/Billing';
import CartList from './components/CartList';
import {
  IconDelete,
  IconClose,
} from '../../../components/Icons';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import Header from '../../../components/Header';

import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import {
  getOnlineStoreInfo,
  getUser,
} from '../../redux/modules/app';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { actions as cartActions, getCreditsBalance, getBusinessInfo } from '../../redux/modules/cart';
import { actions as homeActions, getShoppingCart, getCurrentProduct } from '../../redux/modules/home';

class Cart extends Component {
  state = {
    additionalComments: Utils.getSessionVariable('additionalComments'),
  }

  componentDidMount() {
    const {
      user,
      cartActions,
      homeActions,
    } = this.props;
    const { isLogin } = user || {};

    homeActions.loadProductList();
    cartActions.loadCoreBusiness();

    if (isLogin) {
      cartActions.loadAvailableCashback();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { user } = nextProps;
    const { isLogin } = user || {};

    if (isLogin !== this.props.user.isLogin) {
      cartActions.loadAvailableCashback();
    }
  }

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
    });
  }

  handleClearAll = () => {
    this.props.cartActions.clearAll().then(() => {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      });
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
      creditsBalance,
      cartSummary,
      shoppingCart,
      businessInfo,
    } = this.props;
    const { items } = shoppingCart || {};
    const {
      total,
      count,
      subtotal,
      tax,
      serviceCharge,
    } = cartSummary || {};

    if (!(cartSummary && items)) {
      return null;
    }

    return (
      <section className={`table-ordering__order` /* hide */}>
        <Header
          className="border__bottom-divider gray"
          isPage={true}
          title={`Order ${count || 0} Items`}
          navFunc={this.handleClickBack.bind(this)}
        >
          <button className="warning__button" onClick={this.handleClearAll}>
            <IconDelete />
            <span className="warning__label text-middle">Clear All</span>
          </button>
        </Header>
        <div className="list__container">
          <CartList shoppingCart={shoppingCart} />
          {/* {this.renderAdditionalComments()} */}
        </div>
        <Billing
          tax={tax}
          serviceCharge={serviceCharge}
          businessInfo={businessInfo}
          subtotal={subtotal}
          total={total}
          creditsBalance={creditsBalance <= total ? creditsBalance : total}
        />
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
    user: getUser(state),
    cartSummary: getCartSummary(state),
    shoppingCart: getShoppingCart(state),
    businessInfo: getBusinessInfo(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    currentProduct: getCurrentProduct(state),
    creditsBalance: getCreditsBalance(state),
  }),
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  }),
)(Cart);
