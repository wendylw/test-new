import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import Constants from '../../../../../utils/constants';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getStoreInfoForCleverTap } from '../../../../redux/modules/app';
import {
  getOnlineStoreInfo,
  getBusiness,
  getMerchantCountry,
  getBusinessInfo,
  getDeliveryInfo,
  getShouldAskUserLogin,
} from '../../../../redux/modules/app';
import {
  getPaymentsPendingState,
  getAllPaymentsOptions,
  getSelectedPaymentOption,
  getAllOptionsUnavailableState,
  getSelectedPaymentOptionSupportSaveCard,
} from '../../redux/common/selectors';
import * as paymentCommonThunks from '../../redux/common/thunks';
import { actions as paymentActions } from '../../redux/common/index';
import Utils from '../../../../../utils/utils';
import PaymentItem from '../../components/PaymentItem';
import PayByCash from '../../components/PayByCash';
import Loader from '../../components/Loader';
import './OrderingPayment.scss';
import CleverTap from '../../../../../utils/clevertap';
import loggly from '../../../../../utils/monitoring/loggly';

const { ROUTER_PATHS, DELIVERY_METHOD, PAYMENT_PROVIDERS } = Constants;

class Payment extends Component {
  state = {
    payNowLoading: false,
    cartContainerHeight: '100%',
  };

  willUnmount = false;

  componentDidMount = async () => {
    const { paymentsActions, paymentActions } = this.props;

    paymentActions.updatePayByCashPromptDisplayStatus({ status: false });

    await this.props.appActions.loadShoppingCart();

    /**
     * Load all payment options action and except saved card list
     */
    paymentsActions.loadPaymentOptions();
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

    return {
      // paymentProvider is sent to payment api as paymentName as a parameter, which is the parameter name designed by payment api
      paymentName: paymentProvider,
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
        history.push({
          pathname: ROUTER_PATHS.ORDERING_CART,
          search: window.location.search,
        });
        break;
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

  handleBeforeCreateOrder = async () => {
    const {
      history,
      currentPaymentOption,
      currentPaymentSupportSaveCard,
      shouldAskUserLogin,
      paymentActions,
    } = this.props;
    loggly.log('payment.pay-attempt', { method: currentPaymentOption.paymentProvider });

    this.setState({
      payNowLoading: true,
    });

    if (shouldAskUserLogin) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
      });
      return;
    }

    if (!currentPaymentOption || !currentPaymentOption.paymentProvider) {
      return;
    }

    if (currentPaymentOption.paymentProvider === 'SHOfflinePayment') {
      paymentActions.updatePayByCashPromptDisplayStatus({ status: true });

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
      pendingPaymentOptions,
      storeInfoForCleverTap,
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
          <PayByCash onPayWithCash={redirectUrl => (window.location = redirectUrl)} />
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
            disabled={payNowLoading || areAllOptionsUnavailable}
            validCreateOrder={!currentPaymentOption || !currentPaymentOption.pathname}
            beforeCreateOrder={() => {
              CleverTap.pushEvent('Payment Method - click continue', {
                ...storeInfoForCleverTap,
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

        <Loader className={'loading-cover opacity'} loaded={!pendingPaymentOptions} />
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
        pendingPaymentOptions: getPaymentsPendingState(state),
        allPaymentOptions: getAllPaymentsOptions(state),
        currentPaymentOption: getSelectedPaymentOption(state),
        currentPaymentSupportSaveCard: getSelectedPaymentOptionSupportSaveCard(state),
        areAllOptionsUnavailable: getAllOptionsUnavailableState(state),
        deliveryInfo: getDeliveryInfo(state),
        business: getBusiness(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        businessInfo: getBusinessInfo(state),
        merchantCountry: getMerchantCountry(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
        shouldAskUserLogin: getShouldAskUserLogin(state),
      };
    },
    dispatch => ({
      paymentActions: bindActionCreators(paymentActions, dispatch),
      paymentsActions: bindActionCreators(paymentCommonThunks, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Payment);
