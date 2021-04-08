import React, { Component } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import Constants from '../../../../../utils/constants';

import Utils from '../../../../../utils/utils';

import { bindActionCreators, compose } from 'redux';
import { getCartSummary } from '../../../../../redux/modules/entities/carts';
import { actions as homeActionCreators } from '../../../../redux/modules/home';
import { actions as appActionCreators } from '../../../../redux/modules/app';
import { getDeliveryDetails, actions as customerActionCreators } from '../../../../redux/modules/customer';
import {
  getOnlineStoreInfo,
  getBusiness,
  getMerchantCountry,
  getStoreInfoForCleverTap,
  getUser,
} from '../../../../redux/modules/app';
import { getSelectedPaymentOption, getSelectedPaymentProvider } from '../../redux/common/selectors';
import * as paymentCommonThunks from '../../redux/common/thunks';
import { getBusinessInfo } from '../../../../redux/modules/cart';
import '../../styles/PaymentCreditCard.scss';
import CheckoutForm from './CheckoutForm';

const { PAYMENT_PROVIDERS, ROUTER_PATHS, PAYMENT_METHOD_LABELS } = Constants;
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
      await paymentsActions.loadPaymentOptions(PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY);
    }
  };

  getPaymentEntryRequestData = () => {
    const { user } = this.props;

    return {
      paymentName: PAYMENT_PROVIDERS.STRIPE,
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
          paymentExtraData={this.getPaymentEntryRequestData()}
        />
      </Elements>
    );
  }
}

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      return {
        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
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
