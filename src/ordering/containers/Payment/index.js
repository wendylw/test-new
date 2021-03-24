import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import RedirectForm from './components/RedirectForm';
import CreateOrderButton from '../../components/CreateOrderButton';
import Constants from '../../../utils/constants';
import config from '../../../config';
import _get from 'lodash/get';
import _toString from 'lodash/toString';
import _startsWith from 'lodash/startsWith';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getStoreInfoForCleverTap } from '../../redux/modules/app';
import { getDeliveryDetails, actions as customerActionCreators } from '../../redux/modules/customer';
import { getDeliveryInfo } from '../../redux/modules/home';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getOnlineStoreInfo, getBusiness, getMerchantCountry, getUser, getBusinessInfo } from '../../redux/modules/app';
import { actions as paymentActionCreators, getCurrentOrderId, getCardList } from '../../redux/modules/payment';
import {
  actions as paymentsActionCreator,
  getPaymentsPendingState,
  getAllPaymentsOptions,
  getSelectedPaymentOption,
  getAllOptionsUnavailableState,
} from './redux/payments';
import Utils from '../../../utils/utils';
import { getPaymentRedirectAndWebHookUrl } from './utils';
import PaymentItem from './components/PaymentItem';
import Loader from './components/Loader';
import './OrderingPayment.scss';
import CleverTap from '../../../utils/clevertap';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;

class Payment extends Component {
  state = {
    payNowLoading: false,
    cartContainerHeight: '100%',
  };

  componentDidMount = async () => {
    const { deliveryDetails, customerActions, paymentsActions } = this.props;
    const { addressId } = deliveryDetails || {};
    const type = Utils.getOrderTypeFromUrl();

    !addressId && (await customerActions.initDeliveryDetails(type));

    const { deliveryDetails: newDeliveryDetails } = this.props;
    const { deliveryToLocation } = newDeliveryDetails || {};

    await this.props.appActions.loadShoppingCart(
      deliveryToLocation.latitude &&
        deliveryToLocation.longitude && {
          lat: deliveryToLocation.latitude,
          lng: deliveryToLocation.longitude,
        }
    );

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

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, currentPaymentOption, business, businessInfo } = this.props;
    const { paymentProvider, pathname } = currentPaymentOption;
    const planId = _toString(_get(businessInfo, 'planId', ''));

    if (!onlineStoreInfo || !currentOrder || !paymentProvider || pathname) {
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
      // paymentProvider is sent to payment api as paymentName as a parameter, which is the parameter name designed by payment api
      paymentName: paymentProvider,
      isInternal: _startsWith(planId, 'internal'),
      source: Utils.getOrderSource(),
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

  handleBeforeCreateOrder = async () => {
    const { history, currentPaymentOption, user } = this.props;

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
    if (currentPaymentOption && currentPaymentOption.supportSaveCards) {
      await this.props.paymentActions.fetchSavedCard({
        userId: user.consumerId,
        paymentName: currentPaymentOption.paymentProvider,
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
    if (currentPaymentOption && currentPaymentOption.pathname) {
      history.push({
        pathname: currentPaymentOption.pathname,
        search: window.location.search,
      });

      return;
    }
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
    const paymentData = this.getPaymentEntryRequestData();

    return (
      <section className="ordering-payment flex flex-column" data-heap-name="ordering.payment.container">
        <Header
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

        <Loader className={'loading-cover opacity'} loaded={!pendingPaymentOptions} />
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
        pendingPaymentOptions: getPaymentsPendingState(state),
        allPaymentOptions: getAllPaymentsOptions(state),
        currentPaymentOption: getSelectedPaymentOption(state),
        areAllOptionsUnavailable: getAllOptionsUnavailableState(state),

        deliveryInfo: getDeliveryInfo(state),
        business: getBusiness(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        businessInfo: getBusinessInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        merchantCountry: getMerchantCountry(state),
        deliveryDetails: getDeliveryDetails(state),
        cardList: getCardList(state),
        user: getUser(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      };
    },
    dispatch => ({
      paymentsActions: bindActionCreators(paymentsActionCreator, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(Payment);
