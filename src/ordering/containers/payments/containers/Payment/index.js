import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import _get from 'lodash/get';
import _toString from 'lodash/toString';
import _startsWith from 'lodash/startsWith';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getStoreInfoForCleverTap } from '../../../../redux/modules/app';
import { getDeliveryDetails, actions as customerActionCreators } from '../../../../redux/modules/customer';
import { getDeliveryInfo } from '../../../../redux/modules/home';
import {
  getOnlineStoreInfo,
  getBusiness,
  getMerchantCountry,
  getBusinessInfo,
  getUser,
} from '../../../../redux/modules/app';
import {
  getPaymentsPendingState,
  getAllPaymentsOptions,
  getSelectedPaymentOption,
  getAllOptionsUnavailableState,
  getSelectedPaymentOptionSupportSaveCard,
} from '../../redux/common/selectors';
import * as paymentCommonThunks from '../../redux/common/thunks';
import Utils from '../../../../../utils/utils';
import PaymentItem from '../../components/PaymentItem';
import Loader from '../../components/Loader';
import './OrderingPayment.scss';
import CleverTap from '../../../../../utils/clevertap';

const { ROUTER_PATHS, DELIVERY_METHOD, PAYMENT_PROVIDERS } = Constants;

class Payment extends Component {
  state = {
    payNowLoading: false,
    cartContainerHeight: '100%',
  };

  willUnmount = false;

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
    const { history, currentPaymentOption, currentPaymentSupportSaveCard, user } = this.props;

    this.setState({
      payNowLoading: true,
    });

    if (!Utils.isDigitalType() && !user.consumerId) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
      });
      return;
    }

    if (!currentPaymentOption || !currentPaymentOption.paymentProvider) {
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
        deliveryDetails: getDeliveryDetails(state),
        user: getUser(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      };
    },
    dispatch => ({
      paymentsActions: bindActionCreators(paymentCommonThunks, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(Payment);
