import React, { Component } from 'react';
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
import { actions as appActions } from '../../redux/modules/app';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { actions as paymentActions, getThankYouPageUrl } from '../../redux/modules/payment';
import { actions as cartActions, getBusinessInfo } from '../../redux/modules/cart';
import { actions as homeActions, getShoppingCart, getCurrentProduct } from '../../redux/modules/home';

class Cart extends Component {
  state = {
    expandBilling: false,
    isCreatingOrder: false,
    additionalComments: Utils.getSessionVariable('additionalComments'),
  }

  async componentWillMount() {
    const {
      cartActions,
      homeActions,
      user,
    } = this.props;
    const { consumerId, isLogin } = user || {};


    cartActions.loadCoreBusiness();
    await homeActions.loadShoppingCart();

    if (isLogin) {
      await appActions.loadCustomerProfile({ consumerId });
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

  handleCheckPaymentStatus = async () => {
    const {
      history,
      cartSummary,
      user,
    } = this.props;
    const { isLogin } = user;
    const { cashback, total } = cartSummary || {};

    if (isLogin && !total) {
      const { paymentActions } = this.props;

      this.setState({
        isCreatingOrder: true,
      });

      await paymentActions.createOrder({ cashback });

      const { thankYouPageUrl } = this.props;

      if (thankYouPageUrl) {
        window.location = thankYouPageUrl;
      }

      return;
    }

    history.push(Constants.ROUTER_PATHS.ORDERING_PAYMENT);
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
      cartSummary,
      shoppingCart,
      businessInfo,
    } = this.props;
    const { expandBilling, isCreatingOrder } = this.state;
    const { items } = shoppingCart || {};
    const {
      count,
      subtotal,
      total,
      tax,
      serviceCharge,
      cashback,
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
          <button className="warning__button" onClick={this.handleClearAll.bind(this)}>
            <IconDelete />
            <span className="warning__label text-middle">Clear All</span>
          </button>
        </Header>
        <div className="list__container">
          <CartList shoppingCart={shoppingCart} />
          {/* {this.renderAdditionalComments()} */}
        </div>
        <aside className="aside-bottom">
          <i className="aside-bottom__slide-button" onClick={() => this.setState({ expandBilling: !expandBilling })}></i>
          <Billing
            className={!expandBilling ? 'billing__collapse' : ''}
            tax={tax}
            serviceCharge={serviceCharge}
            businessInfo={businessInfo}
            subtotal={subtotal}
            total={total}
            creditsBalance={cashback}
          />
        </aside>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bold"
              onClick={this.handleClickBack.bind(this)}
            >Back</button>
          </div>
          <div className="footer-operation__item width-2-3">
            <button
              className="billing__link button button__fill button__block font-weight-bold"
              onClick={this.handleCheckPaymentStatus.bind(this)}
              disabled={!items || !items.length || isCreatingOrder}
            >
              {
                isCreatingOrder
                  ? <div className="loader"></div>
                  : 'Pay'
              }
            </button>
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
    thankYouPageUrl: getThankYouPageUrl(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
    homeActions: bindActionCreators(homeActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
    paymentActions: bindActionCreators(paymentActions, dispatch),
  }),
)(Cart);
