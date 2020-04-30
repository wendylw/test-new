import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';
import Header from '../../../components/Header';
import RedirectForm from './components/RedirectForm';
import Constants from '../../../utils/constants';
import config from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators } from '../../redux/modules/home';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getOnlineStoreInfo, getUser, getBusiness, getMerchantCountry } from '../../redux/modules/app';
import {
  actions as paymentActionCreators,
  getCurrentPayment,
  getCurrentOrderId,
  getPayments,
  getDefaultPayment,
  getCurrentPaymentInfo,
} from '../../redux/modules/payment';
import Utils from '../../../utils/utils';
import { getPaymentName, getSupportCreditCardBrands } from './utils';
import Loader from './components/Loader';
import PaymentLogo from './components/PaymentLogo';

const { PAYMENT_METHOD_LABELS, ROUTER_PATHS, DELIVERY_METHOD } = Constants;

const EXCLUDED_PAYMENTS = [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY, PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY];

class Payment extends Component {
  state = {
    payNowLoading: false,
  };

  componentDidMount = async () => {
    const { currentPayment } = this.props;
    this.props.paymentActions.setCurrentPayment(currentPayment);
    await this.props.homeActions.loadShoppingCart();
  };

  getPaymentEntryRequestData = () => {
    const { history, onlineStoreInfo, currentOrder, currentPayment, business, merchantCountry } = this.props;
    const h = config.h();
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const queryString = `?h=${encodeURIComponent(h)}`;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || EXCLUDED_PAYMENTS.includes(currentPayment)) {
      return null;
    }

    const redirectURL = `${config.storehubPaymentResponseURL.replace('%business%', business)}${queryString}${
      type ? '&type=' + type : ''
    }`;
    const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('%business%', business)}${queryString}`;

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL: redirectURL,
      webhookURL: webhookURL,
      paymentName: getPaymentName(merchantCountry, currentPayment),
    };
  };

  handleClickBack = () => {
    const { history } = this.props;
    const type = Utils.getOrderTypeFromUrl();

    switch (type) {
      case DELIVERY_METHOD.PICKUP:
      case DELIVERY_METHOD.DELIVERY:
        history.push({
          pathname: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
          search: window.location.search,
        });
        break;
      case DELIVERY_METHOD.DIGITAL:
        window.location.href = ROUTER_PATHS.VOUCHER_CONTACT;
        break;
      default:
        history.push({
          pathname: ROUTER_PATHS.ORDERING_CART,
          search: window.location.search,
        });
        break;
    }
  };

  setCurrentPayment = paymentLabel => {
    this.props.paymentActions.setCurrentPayment(paymentLabel);
  };

  getPaymentShowLabel(payment) {
    const { t, merchantCountry } = this.props;
    if (payment.label === PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY) {
      const supportCreditCardBrands = getSupportCreditCardBrands(merchantCountry);
      return supportCreditCardBrands
        .map(brand => {
          return t(brand);
        })
        .join(' / ');
    } else {
      return t(payment.label);
    }
  }

  handleClickPayNow = async () => {
    const { history, currentPaymentInfo, cartSummary } = this.props;
    const { totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    this.setState({
      payNowLoading: true,
    });

    // redirect to customized payment page when the payment contains pathname of page router
    if (currentPaymentInfo.pathname) {
      history.push({
        pathname: currentPaymentInfo.pathname,
        search: window.location.search,
      });

      return;
    }

    await this.props.paymentActions.createOrder({ cashback: totalCashback, shippingType: type });

    const { currentOrder } = this.props;
    const { orderId } = currentOrder || {};

    if (orderId) {
      Utils.removeSessionVariable('additionalComments');
      Utils.removeSessionVariable('deliveryComments');
    }

    this.setState({
      payNowLoading: !!orderId,
    });
  };

  render() {
    const { t, currentPayment, payments } = this.props;
    const { payNowLoading } = this.state;
    const className = ['table-ordering__payment' /*, 'hide' */];
    const paymentData = this.getPaymentEntryRequestData();

    return (
      <section className={className.join(' ')}>
        <Header
          className="border__bottom-divider gray has-right flex-middle"
          isPage={true}
          title={t('SelectPayment')}
          navFunc={this.handleClickBack}
        />

        <div>
          <ul className="payment__list">
            {payments.map(payment => {
              if (!payment) {
                return null;
              }

              return (
                <li
                  key={payment.label}
                  className="payment__item border__bottom-divider flex flex-middle flex-space-between"
                  onClick={() => this.setCurrentPayment(payment.label)}
                >
                  <figure className="payment__image-container">
                    <PaymentLogo payment={payment} />
                  </figure>
                  <label className="payment__name font-weight-bolder">{this.getPaymentShowLabel(payment)}</label>
                  <div className={`radio ${currentPayment === payment.label ? 'active' : ''}`}>
                    <i className="radio__check-icon"></i>
                    <input type="radio"></input>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="footer-operation">
          <button
            className="button button__fill button__block font-weight-bolder text-uppercase border-radius-base"
            disabled={payNowLoading}
            onClick={this.handleClickPayNow}
          >
            {payNowLoading ? <div className="loader"></div> : t('PayNow')}
          </button>
        </div>

        {paymentData ? (
          <RedirectForm
            ref={ref => (this.form = ref)}
            action={config.storeHubPaymentEntryURL}
            method="POST"
            data={paymentData}
          />
        ) : null}
      </section>
    );
  }
}

// to use container to make Payment initialization based on payments from a country
const PaymentContainer = props => {
  if (!props.merchantCountry) {
    return <Loader />;
  }

  return <Payment {...props} />;
};

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        payments: getPayments(state),
        currentPayment: getCurrentPayment(state) || getDefaultPayment(state),
        currentPaymentInfo: getCurrentPaymentInfo(state),
        user: getUser(state),
        business: getBusiness(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        merchantCountry: getMerchantCountry(state),
      };
    },
    dispatch => ({
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(PaymentContainer);
