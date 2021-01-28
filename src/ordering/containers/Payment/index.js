import qs from 'qs';
import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import HybridHeader from '../../../components/HybridHeader';
import RedirectForm from './components/RedirectForm';
import CreateOrderButton from '../../components/CreateOrderButton';
import Constants from '../../../utils/constants';
import config from '../../../config';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import _toString from 'lodash/toString';
import _startsWith from 'lodash/startsWith';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators } from '../../redux/modules/home';
import { actions as appActionCreators } from '../../redux/modules/app';
import { getDeliveryDetails, actions as customerActionCreators } from '../../redux/modules/customer';
import { getDeliveryInfo } from '../../redux/modules/home';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getOnlineStoreInfo, getBusiness, getMerchantCountry, getUser } from '../../redux/modules/app';
import {
  actions as paymentActionCreators,
  getCurrentPayment,
  getCurrentOrderId,
  getPayments,
  getDefaultPayment,
  getCurrentPaymentInfo,
  getUnavailablePayments,
  getCardList,
} from '../../redux/modules/payment';
import Utils from '../../../utils/utils';
import { getPaymentName, getPaymentRedirectAndWebHookUrl } from './utils';
import Loader from './components/Loader';
import PaymentLogo from './components/PaymentLogo';
import CurrencyNumber from '../../components/CurrencyNumber';
import Radio from '../../../components/Radio';
import { getBusinessInfo } from '../../redux/modules/cart';
import './OrderingPayment.scss';

const { PAYMENT_METHOD_LABELS, ROUTER_PATHS, DELIVERY_METHOD } = Constants;

const EXCLUDED_PAYMENTS = [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY, PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY];

class Payment extends Component {
  state = {
    payNowLoading: false,
    cartContainerHeight: '100%',
  };

  componentDidMount = async () => {
    const { history, payments, merchantCountry, unavailablePaymentList, deliveryDetails, customerActions } = this.props;
    const availablePayments = payments.filter(p => !unavailablePaymentList.includes(`${merchantCountry}:${p.key}`));
    const { addressId } = deliveryDetails || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    !addressId && (await customerActions.initDeliveryDetails(type));
    this.props.paymentActions.setCurrentPayment(availablePayments[0].label);

    const { deliveryDetails: newDeliveryDetails } = this.props;
    const { deliveryToLocation } = newDeliveryDetails || {};

    await this.props.homeActions.loadShoppingCart(
      deliveryToLocation.latitude &&
        deliveryToLocation.longitude && {
          lat: deliveryToLocation.latitude,
          lng: deliveryToLocation.longitude,
        }
    );
  };

  componentDidUpdate(prevProps, prevStates) {
    const containerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });

    if (prevStates.cartContainerHeight !== containerHeight) {
      this.setState({
        cartContainerHeight: containerHeight,
      });
    }
  }

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, currentPayment, business, businessInfo, merchantCountry } = this.props;
    const planId = _toString(_get(businessInfo, 'planId', ''));

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
      isInternal: _startsWith(planId, 'internal'),
      orderSource: Utils.getOrderSource(),
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
    const { merchantCountry, unavailablePaymentList } = this.props;
    const disabledPayment = unavailablePaymentList.find(p => p === `${merchantCountry}:${key}`);

    if (!disabledPayment) {
      this.props.paymentActions.setCurrentPayment(label);
    }
  };

  handleBeforeCreateOrder = async () => {
    const { history, currentPaymentInfo, user } = this.props;

    this.setState({
      payNowLoading: true,
    });

    if (!user || !user.consumerId) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
      });
    }

    // Check if is credit pay, if credit pay, should check if go to saved page or
    if (currentPaymentInfo && currentPaymentInfo.supportSaveCards) {
      await this.props.paymentActions.fetchSavedCard({
        userId: user.consumerId,
        paymentName: currentPaymentInfo.key,
      });

      const { cardList } = this.props;

      if (cardList && cardList.length) {
        history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_ONLINE_SAVED_CARDS,
          search: window.location.search,
        });
        return;
      } else {
        history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_ADYEN_PAYMENT,
          search: window.location.search,
        });
        return;
      }
    }

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
      merchantCountry,
    } = this.props;
    const { total } = cartSummary || {};
    const { payNowLoading, cartContainerHeight } = this.state;
    const className = ['ordering-payment flex flex-column'];
    const paymentData = this.getPaymentEntryRequestData();
    const minimumFpxTotal = parseFloat(process.env.REACT_APP_PAYMENT_FPX_THRESHOLD_TOTAL);
    const currentUnavailablePayments = unavailablePaymentList.filter(unavailablePayment =>
      _startsWith(unavailablePayment, merchantCountry)
    );
    const allPaymentsUnavailable = currentUnavailablePayments.length === payments.length;

    return (
      <section className={className.join(' ')} data-heap-name="ordering.payment.container">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.payment.header"
          isPage={true}
          title={t('SelectPayment')}
          navFunc={this.handleClickBack}
        />

        <div
          className="ordering-payment__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          <ul>
            {payments.map(payment => {
              const classList = [
                'ordering-payment__item flex flex-middle flex-space-between padding-small border__bottom-divider',
              ];
              const disabledPayment = unavailablePaymentList.find(p => p === `${merchantCountry}:${payment.key}`);
              const promptDom =
                total < minimumFpxTotal && _isEqual(`${merchantCountry}:${payment.key}`, 'MY:onlineBanking') ? (
                  <p className="margin-top-bottom-smaller">
                    ({' '}
                    <Trans i18nKey="MinimumConsumption">
                      <span>Min</span>
                      <CurrencyNumber money={minimumFpxTotal} />
                    </Trans>{' '}
                    )
                  </p>
                ) : (
                  <p className="margin-top-bottom-smaller">{t('TemporarilyUnavailable')}</p>
                );

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
                    <figure className="ordering-payment__image-container text-middle margin-small">
                      <PaymentLogo payment={payment} />
                    </figure>
                    <div className="ordering-payment__description text-middle padding-left-right-normal">
                      <label className="ordering-payment__label text-omit__single-line text-size-big text-weight-bolder">
                        {t(payment.label)}
                      </label>
                      {payment.label === PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY ? (
                        <p className="ordering-payment__prompt">{`${t('Visa')}, ${t('MasterCard')}`}</p>
                      ) : null}
                      {disabledPayment ? promptDom : null}
                    </div>
                  </div>
                  <Radio className="margin-left-right-small" checked={currentPayment === payment.label} />
                </li>
              );
            })}
          </ul>
        </div>

        <footer
          ref={ref => (this.footerEl = ref)}
          className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal"
        >
          <CreateOrderButton
            history={history}
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            data-testid="payNow"
            data-heap-name="ordering.payment.pay-btn"
            disabled={payNowLoading || allPaymentsUnavailable}
            validCreateOrder={!currentPaymentInfo || !currentPaymentInfo.pathname}
            beforeCreateOrder={this.handleBeforeCreateOrder.bind(this)}
            paymentName={getPaymentName(merchantCountry, currentPayment)}
            afterCreateOrder={orderId => {
              this.setState({
                payNowLoading: !!orderId,
              });
            }}
          >
            {payNowLoading ? t('Processing') : t('Continue')}
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
    return <Loader className={'loading-cover opacity'} />;
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
        business: getBusiness(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        businessInfo: getBusinessInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        unavailablePaymentList: getUnavailablePayments(state),
        merchantCountry: getMerchantCountry(state),
        deliveryDetails: getDeliveryDetails(state),
        cardList: getCardList(state),
        user: getUser(state),
      };
    },
    dispatch => ({
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(PaymentContainer);
