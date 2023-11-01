import qs from 'qs';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import Constants from '../../../../../utils/constants';
import {
  actions as appActionCreators,
  getShippingType,
  getHasLoginGuardPassed,
  getPaymentInfoForCleverTap,
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
  getInitPaymentRequestErrorMessage,
  getInitPaymentRequestErrorCategory,
  getIsInitPaymentRequestStatusRejected,
} from '../../redux/common/selectors';
import {
  initialize as initializeThunkCreator,
  createOrder as createOrderThunkCreator,
  gotoPayment as gotoPaymentThunkCreator,
} from '../../redux/common/thunks';
import { actions as paymentActionsCreator } from '../../redux/common/index';
import Utils from '../../../../../utils/utils';
import prefetch from '../../../../../common/utils/prefetch-assets';
import PaymentItem from '../../components/PaymentItem';
import PayByCash from '../../components/PayByCash';
import Loader from '../../components/Loader';
import './OrderingPayment.scss';
import CleverTap from '../../../../../utils/clevertap';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';
import { fetchOrder } from '../../../../../utils/api-request';
import { alert } from '../../../../../common/feedback';
import { getPaymentType } from './utils';

const { PAYMENT_PROVIDERS, ORDER_STATUS, ROUTER_PATHS } = Constants;

class Payment extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    payNowLoading: false,
    cartContainerHeight: '100%',
  };

  willUnmount = false;

  componentDidMount = async () => {
    const { initialize, paymentActions } = this.props;

    paymentActions.updatePayByCashPromptDisplayStatus({ status: false });

    await initialize();

    const { isInitPaymentFailed, initPaymentErrorMessage, initPaymentRequestErrorCategory } = this.props;

    if (isInitPaymentFailed) {
      logger.error(
        'Ordering_Payment_InitializeFailed',
        {
          message: initPaymentErrorMessage,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.CHECKOUT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SELECT_PAYMENT_METHOD,
          },
          errorCategory: initPaymentRequestErrorCategory,
        }
      );
    }

    prefetch(['ORD_OLB', 'ORD_SCS', 'ORD_SRP'], ['OrderingPayment']);
  };

  componentDidUpdate(prevProps, prevStates) {
    const containerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });

    if (prevStates.cartContainerHeight !== containerHeight) {
      // eslint-disable-next-line react/no-did-update-set-state
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
      receiptNumber,
    } = this.props;
    logger.log('Ordering_Payment_PayBySelectedOption', { method: currentPaymentOption.paymentProvider });

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

    try {
      if (currentPaymentOption.paymentProvider === PAYMENT_PROVIDERS.SH_OFFLINE_PAYMENT) {
        // If order has created, no need to display the confirmation modal
        if (receiptNumber) {
          this.handlePayWithCash();
        } else {
          this.setState({
            payNowLoading: false,
          });
          paymentActions.updatePayByCashPromptDisplayStatus({ status: true });
        }

        return;
      }
    } catch (e) {
      logger.error(
        'Ordering_Payment_SubmitOrderFailed',
        {
          message: 'Failed to pay with cash',
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.PAYMENT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.PAYMENT].SUBMIT_ORDER,
          },
        }
      );
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
        pathname,
        search: window.location.search,
      });
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
    const { shippingType, currentPaymentOption, receiptNumber } = this.props;
    const { paymentProvider } = currentPaymentOption;

    try {
      const { t, cashback, createOrder, total, gotoPayment } = this.props;
      this.setState({
        payNowLoading: true,
      });

      logger.log('Ordering_Payment_PayByCash', { method: paymentProvider });

      let orderId = receiptNumber;

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
          logger.log('Ordering_Payment_OrderHasPaid', { id: orderId });

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
        const { order } = await createOrder({ cashback, shippingType });

        orderId = order.orderId;

        logger.log('Ordering_Payment_OrderCreated', { id: orderId });

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
      logger.error('Ordering_Payment_CreateOrderFailed', {
        message: error?.message,
        name: paymentProvider,
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

    if (!orderId) {
      const { currentPaymentOption } = this.props;

      logger.error(
        'Ordering_Payment_SubmitOrderFailed',
        {
          message: 'Failed to submit order',
          name: currentPaymentOption.paymentProvider,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.PAYMENT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.PAYMENT].SUBMIT_ORDER,
          },
        }
      );
    }
  };

  handleSelectPaymentOption = () => {
    const { paymentInfoForCleverTap } = this.props;

    CleverTap.pushEvent('Payment Method - click payment method', paymentInfoForCleverTap);
  };

  renderPaymentList() {
    const { allPaymentOptions } = this.props;

    return (
      <ul>
        {allPaymentOptions.map(option => (
          <PaymentItem key={option.key} option={option} onSelect={this.handleSelectPaymentOption} />
        ))}
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
      paymentInfoForCleverTap,
    } = this.props;
    const { payNowLoading, cartContainerHeight } = this.state;

    return (
      <section className="ordering-payment flex flex-column" data-test-id="ordering.payment.container">
        <HybridHeader
          // eslint-disable-next-line no-return-assign
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-test-id="ordering.payment.header"
          isPage
          title={t('SelectPayment')}
          navFunc={() => {
            CleverTap.pushEvent('Payment Method - click back arrow', paymentInfoForCleverTap);
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
          // eslint-disable-next-line no-return-assign
          ref={ref => (this.footerEl = ref)}
          className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal"
        >
          <CreateOrderButton
            history={history}
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            data-testid="payNow"
            data-test-id="ordering.payment.pay-btn"
            orderId={receiptNumber}
            total={total}
            disabled={payNowLoading || areAllOptionsUnavailable}
            validCreateOrder={!currentPaymentOption || !currentPaymentOption.pathname}
            beforeCreateOrder={() => {
              CleverTap.pushEvent('Payment Method - click continue', {
                ...cleverTapAttributes,
                ...paymentInfoForCleverTap,
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

        <Loader className="loading-cover opacity" loaded={!loaderVisibility} />
      </section>
    );
  }
}
Payment.displayName = 'Payment';

Payment.propTypes = {
  initialize: PropTypes.func,
  /* eslint-disable react/forbid-prop-types */
  paymentActions: PropTypes.object,
  allPaymentOptions: PropTypes.array,
  cleverTapAttributes: PropTypes.object,
  currentPaymentOption: PropTypes.object,
  paymentInfoForCleverTap: PropTypes.object,
  /* eslint-enable */
  createOrder: PropTypes.func,
  gotoPayment: PropTypes.func,
  currentPaymentSupportSaveCard: PropTypes.bool,
  hasLoginGuardPassed: PropTypes.bool,
  receiptNumber: PropTypes.string,
  loaderVisibility: PropTypes.bool,
  areAllOptionsUnavailable: PropTypes.bool,
  total: PropTypes.number,
  shippingType: PropTypes.string,
  cashback: PropTypes.number,
  initPaymentErrorMessage: PropTypes.string,
  initPaymentRequestErrorCategory: PropTypes.string,
  isInitPaymentFailed: PropTypes.bool,
};

Payment.defaultProps = {
  initialize: () => {},
  paymentActions: {},
  createOrder: () => {},
  gotoPayment: () => {},
  currentPaymentOption: {},
  paymentInfoForCleverTap: {},
  currentPaymentSupportSaveCard: true,
  hasLoginGuardPassed: true,
  receiptNumber: null,
  loaderVisibility: false,
  allPaymentOptions: [],
  areAllOptionsUnavailable: false,
  cleverTapAttributes: {},
  total: 0,
  shippingType: '',
  cashback: 0,
  initPaymentErrorMessage: '',
  initPaymentRequestErrorCategory: '',
  isInitPaymentFailed: false,
};

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => ({
      loaderVisibility: getLoaderVisibility(state),
      allPaymentOptions: getAllPaymentsOptions(state),
      currentPaymentOption: getSelectedPaymentOption(state),
      currentPaymentSupportSaveCard: getSelectedPaymentOptionSupportSaveCard(state),
      areAllOptionsUnavailable: getAllOptionsUnavailableState(state),
      cleverTapAttributes: getCleverTapAttributes(state),
      paymentInfoForCleverTap: getPaymentInfoForCleverTap(state),
      receiptNumber: getReceiptNumber(state),
      total: getTotal(state),
      shippingType: getShippingType(state),
      cashback: getCashback(state),
      hasLoginGuardPassed: getHasLoginGuardPassed(state),
      initPaymentErrorMessage: getInitPaymentRequestErrorMessage(state),
      initPaymentRequestErrorCategory: getInitPaymentRequestErrorCategory(state),
      isInitPaymentFailed: getIsInitPaymentRequestStatusRejected(state),
    }),
    dispatch => ({
      paymentActions: bindActionCreators(paymentActionsCreator, dispatch),
      initialize: bindActionCreators(initializeThunkCreator, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      createOrder: bindActionCreators(createOrderThunkCreator, dispatch),
      gotoPayment: bindActionCreators(gotoPaymentThunkCreator, dispatch),
    })
  )
)(Payment);
