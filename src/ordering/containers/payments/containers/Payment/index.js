import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import Constants from '../../../../../utils/constants';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators } from '../../../../redux/modules/app';
import {
  getOnlineStoreInfo,
  getBusiness,
  getMerchantCountry,
  getBusinessInfo,
  getDeliveryInfo,
  getShippingType,
  getHasLoginGuardPassed,
} from '../../../../redux/modules/app';
import {
  getLoaderVisibility,
  getAllPaymentsOptions,
  getSelectedPaymentOption,
  getAllOptionsUnavailableState,
  getSelectedPaymentOptionSupportSaveCard,
  getCleverTapAttributes,
  getReceiptNumber,
  getTotal,
  getCashback,
} from '../../redux/common/selectors';
import qs from 'qs';
import {
  loadBilling,
  loadPaymentOptions,
  createOrder as createOrderThunkCreator,
  gotoPayment as gotoPaymentThunkCreator,
} from '../../redux/common/thunks';
import { actions as paymentActions } from '../../redux/common/index';
import Utils from '../../../../../utils/utils';
import PaymentItem from '../../components/PaymentItem';
import PayByCash from '../../components/PayByCash';
import Loader from '../../components/Loader';
import './OrderingPayment.scss';
import CleverTap from '../../../../../utils/clevertap';
import loggly from '../../../../../utils/monitoring/loggly';
import { fetchOrder } from '../../../../../utils/api-request';
import { alert } from '../../../../../common/feedback';
import { getPaymentType } from './utils';

const { PAYMENT_PROVIDERS, ORDER_STATUS, ROUTER_PATHS } = Constants;

class Payment extends Component {
  state = {
    payNowLoading: false,
    cartContainerHeight: '100%',
  };

  willUnmount = false;

  componentDidMount = async () => {
    const { loadPaymentOptions, loadBilling, paymentActions } = this.props;

    paymentActions.updatePayByCashPromptDisplayStatus({ status: false });

    await loadBilling();

    /**
     * Load all payment options action and except saved card list
     */
    loadPaymentOptions();
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

  componentWillUnmount() {
    this.willUnmount = true;
  }

  getPaymentEntryRequestData = () => {
    const { currentPaymentOption } = this.props;
    const { paymentProvider } = currentPaymentOption;
    const paymentType = getPaymentType(paymentProvider);

    return {
      paymentProvider,
      paymentType,
    };
  };

  handleClickBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleBeforeCreateOrder = async () => {
    const {
      history,
      currentPaymentOption,
      currentPaymentSupportSaveCard,
      hasLoginGuardPassed,
      paymentActions,
    } = this.props;
    loggly.log('payment.pay-attempt', { method: currentPaymentOption.paymentProvider });

    this.setState({
      payNowLoading: true,
    });

    if (!hasLoginGuardPassed) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
        state: { shouldGoBack: true },
      });
      return;
    }

    if (!currentPaymentOption || !currentPaymentOption.paymentProvider) {
      return;
    }

    if (currentPaymentOption.paymentProvider === PAYMENT_PROVIDERS.SH_OFFLINE_PAYMENT) {
      // If order has created, no need to display the confirmation modal
      if (this.props.receiptNumber) {
        this.handlePayWithCash();
      } else {
        this.setState({
          payNowLoading: false,
        });
        paymentActions.updatePayByCashPromptDisplayStatus({ status: true });
      }

      return;
    }

    const { pathname, paymentProvider } = currentPaymentOption;

    // currently only Stripe payment support save cards
    if (paymentProvider === PAYMENT_PROVIDERS.STRIPE && currentPaymentSupportSaveCard) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_ONLINE_SAVED_CARDS,
        search: window.location.search,
      });

      return;
    }

    // redirect to customized payment page when the payment contains pathname of page router
    if (pathname) {
      history.push({
        pathname: pathname,
        search: window.location.search,
      });

      return;
    }
  };

  gotoThankyouPage = (orderId, type) => {
    const thankYouPagePath = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.THANK_YOU}`;
    const queryString = qs.stringify(
      {
        h: Utils.getStoreHashCode(),
        type,
        receiptNumber: orderId,
      },
      {
        addQueryPrefix: true,
      }
    );

    window.location.href = `${thankYouPagePath}${queryString}`;
  };

  // TODO: This place logic almost same as the “handleCreateOrder” function that in CreateOrderButton component
  handlePayWithCash = async () => {
    const { shippingType, currentPaymentOption } = this.props;
    const paymentProvider = currentPaymentOption.paymentProvider;

    try {
      const { t, cashback, createOrder, total, gotoPayment } = this.props;
      this.setState({
        payNowLoading: true,
      });

      loggly.log('payment.pay-attempt', { method: paymentProvider });

      let orderId = this.props.receiptNumber;

      // For pay later order, if order has already been paid, then let user goto Thankyou page directly
      if (orderId) {
        const order = await fetchOrder(orderId);

        if (
          [
            ORDER_STATUS.PAID,
            ORDER_STATUS.READY_FOR_DELIVERY,
            ORDER_STATUS.READY_FOR_PICKUP,
            ORDER_STATUS.SHIPPED,
            ORDER_STATUS.ACCEPTED,
            ORDER_STATUS.LOGISTICS_CONFIRMED,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.DELIVERED,
          ].includes(order.status)
        ) {
          loggly.log('ordering.order-has-paid', { order });

          alert(t('OrderHasPaidAlertDescription'), {
            closeButtonContent: t('Continue'),
            title: t('OrderHasPaidAlertTitle'),
            onClose: () => {
              this.gotoThankyouPage(orderId, shippingType);
            },
          });
          return;
        }
      }

      if (!orderId) {
        window.newrelic?.addPageAction('ordering.common.create-order-btn.create-order-start', {
          paymentName: paymentProvider,
        });

        const { order } = await createOrder({ cashback, shippingType });

        window.newrelic?.addPageAction('ordering.common.create-order-btn.create-order-done', {
          paymentName: paymentProvider,
        });

        orderId = order.orderId;

        loggly.log('ordering.order-created', { orderId });

        if (orderId) {
          Utils.removeSessionVariable('additionalComments');
          Utils.removeSessionVariable('deliveryComments');
        }
      }

      if (orderId) {
        await gotoPayment(
          { orderId, total },
          {
            paymentProvider,
          }
        );
      }
    } catch (error) {
      window.newrelic?.addPageAction('ordering.createOrder.error', {
        error: error?.message,
        shippingType,
        paymentName: paymentProvider,
      });

      loggly.error('ordering.createOrder.error', {
        error: error?.message,
        shippingType,
        paymentName: paymentProvider,
      });

      this.setState({
        payNowLoading: false,
      });
    }
  };

  handleAfterCreateOrder = orderId => {
    // Resolve React Warning: perform a set state after component unmounted
    if (this.willUnmount) {
      return;
    }

    this.setState({
      payNowLoading: !!orderId,
    });
  };

  renderPaymentList() {
    const { allPaymentOptions } = this.props;

    return (
      <ul>
        {allPaymentOptions.map(option => {
          return <PaymentItem key={option.key} option={option} />;
        })}
      </ul>
    );
  }

  render() {
    const {
      history,
      t,
      currentPaymentOption,
      areAllOptionsUnavailable,
      loaderVisibility,
      cleverTapAttributes,
      receiptNumber,
      total,
    } = this.props;
    const { payNowLoading, cartContainerHeight } = this.state;

    return (
      <section className="ordering-payment flex flex-column" data-heap-name="ordering.payment.container">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.payment.header"
          isPage={true}
          title={t('SelectPayment')}
          navFunc={() => {
            CleverTap.pushEvent('Payment Method - click back arrow');
            this.handleClickBack();
          }}
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
          {this.renderPaymentList()}
          <PayByCash loading={payNowLoading} onPayWithCash={this.handlePayWithCash} />
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
            orderId={receiptNumber}
            total={total}
            disabled={payNowLoading || areAllOptionsUnavailable}
            validCreateOrder={!currentPaymentOption || !currentPaymentOption.pathname}
            beforeCreateOrder={() => {
              CleverTap.pushEvent('Payment Method - click continue', {
                ...cleverTapAttributes,
                'payment method': currentPaymentOption?.paymentName,
              });
              this.handleBeforeCreateOrder();
            }}
            paymentName={currentPaymentOption.paymentProvider}
            afterCreateOrder={this.handleAfterCreateOrder}
            paymentExtraData={this.getPaymentEntryRequestData()}
            processing={payNowLoading}
            loaderText={t('Processing')}
          >
            {payNowLoading ? t('Processing') : t('Continue')}
          </CreateOrderButton>
        </footer>

        <Loader className={'loading-cover opacity'} loaded={!loaderVisibility} />
      </section>
    );
  }
}
Payment.displayName = 'Payment';

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      return {
        loaderVisibility: getLoaderVisibility(state),
        allPaymentOptions: getAllPaymentsOptions(state),
        currentPaymentOption: getSelectedPaymentOption(state),
        currentPaymentSupportSaveCard: getSelectedPaymentOptionSupportSaveCard(state),
        areAllOptionsUnavailable: getAllOptionsUnavailableState(state),
        deliveryInfo: getDeliveryInfo(state),
        business: getBusiness(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        businessInfo: getBusinessInfo(state),
        merchantCountry: getMerchantCountry(state),
        cleverTapAttributes: getCleverTapAttributes(state),
        receiptNumber: getReceiptNumber(state),
        total: getTotal(state),
        shippingType: getShippingType(state),
        cashback: getCashback(state),
        hasLoginGuardPassed: getHasLoginGuardPassed(state),
      };
    },
    dispatch => ({
      paymentActions: bindActionCreators(paymentActions, dispatch),
      loadBilling: bindActionCreators(loadBilling, dispatch),
      loadPaymentOptions: bindActionCreators(loadPaymentOptions, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      createOrder: bindActionCreators(createOrderThunkCreator, dispatch),
      gotoPayment: bindActionCreators(gotoPaymentThunkCreator, dispatch),
    })
  )
)(Payment);
