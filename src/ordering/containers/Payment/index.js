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
import { actions as paymentActionCreators, getCurrentPayment, getCurrentOrderId } from '../../redux/modules/payment';
import Utils from '../../../utils/utils';
import { getPaymentName, getPaymentList, getSupportCreditCardBrands } from './utils';
import paymentBankingImage from '../../../images/payment-banking.png';
import paymentCreditImage from '../../../images/payment-credit.png';
import paymentBoostImage from '../../../images/payment-boost.png';
import paymenbGrabImage from '../../../images/payment-grab.png';
import paymenbTNGImage from '../../../images/payment-tng.svg';

const { PAYMENT_METHOD_LABELS, ROUTER_PATHS } = Constants;
const dataSource = {
  onlineBanking: {
    logo: paymentBankingImage,
    label: 'OnlineBanking',
    pathname: ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT,
  },
  creditCard: {
    logo: paymentCreditImage,
    label: 'CreditCard',
    pathname: ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT,
  },
  boost: {
    logo: paymentBoostImage,
    label: 'Boost',
  },
  grabPay: {
    logo: paymenbGrabImage,
    label: 'GrabPay',
  },
  TNG: {
    name: PAYMENT_METHODS.TNG_PAY,
    logo: paymenbTNGImage,
    labelKey: 'TouchNGo',
  },
};
const EXCLUDED_PAYMENTS = [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY, PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY];

class Payment extends Component {
  state = {
    payNowLoading: false,
    paymentList: [],
  };

  componentDidMount = async () => {
    const { homeActions } = this.props;
    this.updatePaymentList(() => {
      /* set default payment by dynamic setting*/
      this.setDefaultPayment(this.state.paymentList);
    });

    await homeActions.loadShoppingCart();
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.merchantCountry !== this.props.merchantCountry) {
      this.updatePaymentList(() => {
        if (!this.currentPayment) {
          this.setDefaultPayment(this.state.paymentList);
        }
      });
    }
  }

  updatePaymentList = cb => {
    const { merchantCountry } = this.props;
    if (merchantCountry) {
      this.setState(
        {
          paymentList: getPaymentList(merchantCountry),
        },
        cb
      );
    }
  };

  setDefaultPayment = paymentList => {
    if (paymentList && paymentList.length > 0) {
      const payment = dataSource[paymentList[0]];
      this.setCurrentPayment(payment.label);
    }
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
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    history.push({
      pathname: type ? ROUTER_PATHS.ORDERING_CUSTOMER_INFO : ROUTER_PATHS.ORDERING_CART,
      search: window.location.search,
    });
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
    const { history, currentPayment, cartSummary, t } = this.props;
    const { totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    this.setState({
      payNowLoading: true,
    });

    if (EXCLUDED_PAYMENTS.includes(currentPayment)) {
      const { pathname } = Object.values(dataSource).find(payment => payment.label === currentPayment) || {};

      history.push({
        pathname,
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
    const { t, currentPayment } = this.props;
    const { payNowLoading, paymentList } = this.state;
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
            {paymentList.map(paymentKey => {
              const payment = dataSource[paymentKey];

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
                    <img src={payment.logo} alt={payment.label}></img>
                  </figure>
                  <label className="payment__name font-weight-bold">{this.getPaymentShowLabel(payment)}</label>
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
            className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
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

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        user: getUser(state),
        business: getBusiness(state),
        cartSummary: getCartSummary(state),
        currentPayment: getCurrentPayment(state),
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
)(Payment);
