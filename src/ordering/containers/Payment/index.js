import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import Header from '../../../components/Header';
import RedirectForm from './components/RedirectForm';
import CreateOrderButton from '../../components/CreateOrderButton';
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
  getUnavailablePayments,
} from '../../redux/modules/payment';
import Utils from '../../../utils/utils';
import { getPaymentName, getSupportCreditCardBrands, getPaymentRedirectAndWebHookUrl } from './utils';
import Loader from './components/Loader';
import PaymentLogo from './components/PaymentLogo';
import CurrencyNumber from '../../components/CurrencyNumber';
import Radio from '../../../components/Radio';
import './OrderingPayment.scss';

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
    const { onlineStoreInfo, currentOrder, currentPayment, business, merchantCountry } = this.props;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || EXCLUDED_PAYMENTS.includes(currentPayment)) {
      return null;
    }

    const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);

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
      currentPaymentInfo,
    } = this.props;
    const { total } = cartSummary || {};
    const { payNowLoading } = this.state;
    const className = ['ordering-payment flex flex-column'];
    const paymentData = this.getPaymentEntryRequestData();
    const minimumFpxTotal = parseFloat(process.env.REACT_APP_PAYMENT_FPX_THRESHOLD_TOTAL);
    const promptDom =
      total >= minimumFpxTotal ? (
        <p className="margin-top-bottom-smallest">{t('TemporarilyUnavailable')}</p>
      ) : (
        <p className="margin-top-bottom-smallest">
          ({' '}
          <Trans i18nKey="MinimumConsumption">
            <span>Min</span>
            <CurrencyNumber money={minimumFpxTotal} />
          </Trans>{' '}
          )
        </p>
      );

    return (
      <section className={className.join(' ')} data-heap-name="ordering.payment.container">
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.payment.header"
          isPage={true}
          title={t('SelectPayment')}
          navFunc={this.handleClickBack}
        />

        <div className="ordering-payment__container">
          <ul>
            {payments.map(payment => {
              const classList = [
                'ordering-payment__item flex flex-middle flex-space-between padding-small border__bottom-divider',
              ];
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
                  <div className="ordering-payment__item-content">
                    <figure className="ordering-payment__image-container text-middle margin-smaller">
                      <PaymentLogo payment={payment} />
                    </figure>
                    <div className="ordering-payment__description text-middle padding-left-right-normal">
                      <label className="ordering-payment__label text-omit__single-line text-size-big text-weight-bolder">
                        {this.getPaymentShowLabel(payment)}
                      </label>
                      {disabledPayment ? promptDom : null}
                    </div>
                  </div>
                  <Radio className="margin-left-right-smaller" checked={currentPayment === payment.label} />
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <CreateOrderButton
            history={history}
            className="button button__block button__fill padding-normal margin-top-bottom-smallest text-weight-bolder text-uppercase"
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
        </footer>

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
        unavailablePaymentList: getUnavailablePayments(state),
        merchantCountry: getMerchantCountry(state),
      };
    },
    dispatch => ({
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(PaymentContainer);
