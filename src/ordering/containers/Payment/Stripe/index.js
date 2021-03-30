import React, { Component } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import _toString from 'lodash/toString';
import _startsWith from 'lodash/startsWith';
import Constants from '../../../../utils/constants';

import RedirectForm from '../components/RedirectForm';
import config from '../../../../config';
import Utils from '../../../../utils/utils';

import { bindActionCreators, compose } from 'redux';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { actions as appActionCreators } from '../../../redux/modules/app';
import { getDeliveryDetails, actions as customerActionCreators } from '../../../redux/modules/customer';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import {
  getOnlineStoreInfo,
  getBusiness,
  getMerchantCountry,
  getStoreInfoForCleverTap,
  getUser,
} from '../../../redux/modules/app';
import { getCurrentOrderId } from '../../../redux/modules/payment';
import { getSelectedPaymentOption, getSelectedPaymentProvider } from '../redux/common/selectors';
import * as paymentCommonThunks from '../redux/common/thunks';
import { getBusinessInfo } from '../../../redux/modules/cart';
import { getPaymentRedirectAndWebHookUrl } from '../utils';
import '../PaymentCreditCard.scss';
import CheckoutForm from './CheckoutForm';

const { PAYMENT_PROVIDERS, PAYMENT_API_PAYMENT_OPTIONS, ROUTER_PATHS } = Constants;
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripeMYPromise = loadStripe(process.env.REACT_APP_PAYMENT_STRIPE_MY_KEY || '');
const stripeSGPromise = loadStripe(process.env.REACT_APP_PAYMENT_STRIPE_SG_KEY || '');

// React Stripe.js reference: https://stripe.com/docs/stripe-js/react
class Stripe extends Component {
  async componentDidMount() {
    try {
      await this.ensurePaymentProvider();

      const { deliveryDetails, customerActions } = this.props;
      const { addressId } = deliveryDetails || {};
      const type = Utils.getOrderTypeFromUrl();

      !addressId && (await customerActions.initDeliveryDetails(type));

      const { deliveryDetails: newDeliveryDetails } = this.props;
      const { deliveryToLocation } = newDeliveryDetails || {};

      this.props.homeActions.loadShoppingCart(
        deliveryToLocation.latitude &&
          deliveryToLocation.longitude && {
            lat: deliveryToLocation.latitude,
            lng: deliveryToLocation.longitude,
          }
      );
    } catch (error) {
      // TODO: handle this error in Payment 2.0
      console.error(error);
    }
  }

  ensurePaymentProvider = async () => {
    const { paymentProvider, paymentsActions } = this.props;
    // refresh page will lost state
    if (!paymentProvider) {
      await paymentsActions.loadPaymentOptions();

      paymentsActions.updatePaymentOptionSelected(PAYMENT_PROVIDERS.STRIPE);
    }
  };

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, business, businessInfo, user } = this.props;
    const planId = _toString(_get(businessInfo, 'planId', ''));

    if (!onlineStoreInfo || !currentOrder) {
      return null;
    }

    const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL,
      webhookURL,
      paymentName: PAYMENT_PROVIDERS.STRIPE,
      isInternal: _startsWith(planId, 'internal'),
      source: Utils.getOrderSource(),
      paymentOption: null,
      paymentMethodId: '',
      userId: user.consumerId,
    };
  };

  render() {
    const {
      t,
      match,
      history,
      cartSummary,
      merchantCountry,
      selectedPaymentOption,
      storeInfoForCleverTap,
      showMessageModal,
    } = this.props;
    const supportSaveCard = _get(selectedPaymentOption, 'supportSaveCard', false);
    const isAddCardPath = ROUTER_PATHS.ORDERING_STRIPE_PAYMENT_SAVE === history.location.pathname;

    return (
      <Elements stripe={merchantCountry === 'SG' ? stripeSGPromise : stripeMYPromise} options={{}}>
        <CheckoutForm
          showMessageModal={showMessageModal}
          match={match}
          t={t}
          history={history}
          isAddCardPath={isAddCardPath}
          country={merchantCountry}
          cartSummary={cartSummary}
          storeInfoForCleverTap={storeInfoForCleverTap}
          supportSaveCard={supportSaveCard}
          renderRedirectForm={(paymentMethod, saveCard) => {
            if (!paymentMethod) return null;

            const requestData = { ...this.getPaymentEntryRequestData(), paymentMethodId: paymentMethod.id };
            if (supportSaveCard && saveCard) {
              requestData.paymentOption = PAYMENT_API_PAYMENT_OPTIONS.SAVE_CARD;
            }

            const { receiptNumber } = requestData;

            return requestData && receiptNumber ? (
              <RedirectForm
                key="stripe-payment-redirect-form"
                action={config.storeHubPaymentEntryURL}
                method="POST"
                data={requestData}
              />
            ) : null;
          }}
        />
      </Elements>
    );
  }
}

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        merchantCountry: getMerchantCountry(state),
        deliveryDetails: getDeliveryDetails(state),
        user: getUser(state),
        paymentProvider: getSelectedPaymentProvider(state),
        selectedPaymentOption: getSelectedPaymentOption(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      };
    },
    dispatch => ({
      showMessageModal: bindActionCreators(appActionCreators.showMessageModal, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      paymentsActions: bindActionCreators(paymentCommonThunks, dispatch),
    })
  )
)(Stripe);
