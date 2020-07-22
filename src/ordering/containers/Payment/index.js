import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import qs from 'qs';
import Header from '../../../components/Header';
import RedirectForm from './components/RedirectForm';
import CreateOrderButton from '../../components/CreateOrderButton';
import Constants from '../../../utils/constants';
import config from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators } from '../../redux/modules/home';
import { actions as appActionCreators } from '../../redux/modules/app';
import { getDeliveryInfo } from '../../redux/modules/home';
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
  getUnavailablePayments,
} from '../../redux/modules/payment';
import Utils from '../../../utils/utils';
import { getPaymentName, getSupportCreditCardBrands } from './utils';
import Loader from './components/Loader';
import PaymentLogo from './components/PaymentLogo';
import CurrencyNumber from '../../components/CurrencyNumber';
import { getBusinessInfo } from '../../redux/modules/cart';

const { PAYMENT_METHOD_LABELS, ROUTER_PATHS, DELIVERY_METHOD } = Constants;

const EXCLUDED_PAYMENTS = [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY, PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY];

class Payment extends Component {
  state = {
    payNowLoading: false,
  };

  componentDidMount = async () => {
    const { payments, unavailablePaymentList } = this.props;
    const availablePayments = payments.filter(p => !unavailablePaymentList.includes(p.key));

    this.props.paymentActions.setCurrentPayment(availablePayments[0].label);
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
      case DELIVERY_METHOD.DIGITAL:
        window.location.href = ROUTER_PATHS.VOUCHER_CONTACT;
        break;
      case DELIVERY_METHOD.DINE_IN:
      case DELIVERY_METHOD.TAKE_AWAY:
      case DELIVERY_METHOD.DELIVERY:
      case DELIVERY_METHOD.PICKUP:
      default:
        history.push({
          pathname: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
          search: window.location.search,
        });
        break;
    }
  };

  setCurrentPayment = ({ label, key }) => {
    const { unavailablePaymentList } = this.props;
    const disabledPayment = unavailablePaymentList.find(p => p === key);

    if (!disabledPayment) {
      this.props.paymentActions.setCurrentPayment(label);
    }
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

  handleBeforeCreateOrder = () => {
    const { history, currentPaymentInfo } = this.props;

    this.setState({
      payNowLoading: true,
    });

    // redirect to customized payment page when the payment contains pathname of page router
    if (currentPaymentInfo && currentPaymentInfo.pathname) {
      history.push({
        pathname: currentPaymentInfo.pathname,
        search: window.location.search,
      });

      return;
    }
  };

  render() {
    const {
      history,
      t,
      currentPayment,
      payments,
      unavailablePaymentList,
      cartSummary,
      currentOrder,
      currentPaymentInfo,
    } = this.props;
    const { total } = cartSummary || {};
    const { orderId } = currentOrder || {};
    const { payNowLoading } = this.state;
    const className = ['table-ordering__payment' /*, 'hide' */];
    const paymentData = this.getPaymentEntryRequestData();
    const minimumFpxTotal = parseFloat(process.env.REACT_APP_PAYMENT_FPX_THRESHOLD_TOTAL);
    const promptDom =
      total >= minimumFpxTotal ? (
        <span className="payment__prompt">{t('TemporarilyUnavailable')}</span>
      ) : (
        <span className="payment__prompt">
          ({' '}
          <Trans i18nKey="MinimumConsumption">
            <span>Min</span>
            <CurrencyNumber money={minimumFpxTotal} />
          </Trans>{' '}
          )
        </span>
      );

    return (
      <section className={className.join(' ')} data-heap-name="ordering.payment.container">
        <Header
          className="border__bottom-divider gray has-right flex-middle"
          data-heap-name="ordering.payment.header"
          isPage={true}
          title={t('SelectPayment')}
          navFunc={this.handleClickBack}
        />

        <div>
          <ul className="payment__list">
            {payments.map(payment => {
              const classList = ['payment__item border__bottom-divider flex flex-middle flex-space-between'];
              const disabledPayment = unavailablePaymentList.find(p => p === payment.key);

              if (!payment) {
                return null;
              }

              if (disabledPayment) {
                classList.push('disabled');
              }

              return (
                <li
                  key={payment.label}
                  className={classList.join(' ')}
                  data-testid="paymentSelector"
                  data-heap-name="ordering.payment.payment-item"
                  data-heap-payment-name={payment.label}
                  onClick={() => this.setCurrentPayment(payment)}
                >
                  <figure className="payment__image-container">
                    <PaymentLogo payment={payment} />
                  </figure>
                  <div className="payment__name">
                    <label className="font-weight-bolder">{this.getPaymentShowLabel(payment)}</label>
                    {disabledPayment ? promptDom : null}
                  </div>
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
          <CreateOrderButton
            history={history}
            className="border-radius-base"
            data-testid="payNow"
            data-heap-name="ordering.payment.pay-btn"
            disabled={payNowLoading}
            validCreateOrder={!currentPaymentInfo || !currentPaymentInfo.pathname}
            beforeCreateOrder={this.handleBeforeCreateOrder.bind(this)}
            afterCreateOrder={orderId => {
              this.setState({
                payNowLoading: !!orderId,
              });
            }}
          >
            {payNowLoading ? <div className="loader"></div> : t('PayNow')}
          </CreateOrderButton>
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
        deliveryInfo: getDeliveryInfo(state),
        payments: getPayments(state),
        currentPayment: getCurrentPayment(state) || getDefaultPayment(state),
        currentPaymentInfo: getCurrentPaymentInfo(state),
        user: getUser(state),
        business: getBusiness(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        businessInfo: getBusinessInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        unavailablePaymentList: getUnavailablePayments(state),
        merchantCountry: getMerchantCountry(state),
      };
    },
    dispatch => ({
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(PaymentContainer);
