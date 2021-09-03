import React, { Component } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Constants from '../../../../../utils/constants';
import { bindActionCreators, compose } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusiness,
  getMerchantCountry,
  getStoreInfoForCleverTap,
  getUser,
  getCartBilling,
  getBusinessInfo,
} from '../../../../redux/modules/app';
import { getSelectedPaymentOptionSupportSaveCard, getSelectedPaymentProvider } from '../../redux/common/selectors';
import * as paymentCommonThunks from '../../redux/common/thunks';
import '../../styles/PaymentCreditCard.scss';
import CheckoutForm from './CheckoutForm';

const { PAYMENT_PROVIDERS, ROUTER_PATHS, PAYMENT_METHOD_LABELS } = Constants;
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripeMYPromise = loadStripe(process.env.REACT_APP_PAYMENT_STRIPE_MY_KEY || '')
  .then(stripe => {
    window.newrelic?.addPageAction('common.stripe-load-success', {
      country: 'MY',
    });
    return stripe;
  })
  .catch(err => {
    window.newrelic?.addPageAction('common.stripe-load-failure', {
      error: err?.message,
      country: 'MY',
    });
    throw err;
  });
const stripeSGPromise = loadStripe(process.env.REACT_APP_PAYMENT_STRIPE_SG_KEY || '')
  .then(stripe => {
    window.newrelic?.addPageAction('common.stripe-load-success', {
      country: 'SG',
    });
    return stripe;
  })
  .catch(err => {
    window.newrelic?.addPageAction('common.stripe-load-failure', {
      error: err?.message,
      country: 'SG',
    });
    throw err;
  });

// React Stripe.js reference: https://stripe.com/docs/stripe-js/react
class Stripe extends Component {
  async componentDidMount() {
    try {
      await this.ensurePaymentProvider();

      this.props.appActions.loadShoppingCart();
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
      cartBilling,
      merchantCountry,
      supportSaveCard,
      storeInfoForCleverTap,
      appActions,
    } = this.props;
    const isAddCardPath = ROUTER_PATHS.ORDERING_STRIPE_PAYMENT_SAVE === history.location.pathname;

    return (
      <Elements stripe={merchantCountry === 'SG' ? stripeSGPromise : stripeMYPromise} options={{}}>
        <CheckoutForm
          showMessageModal={appActions.showMessageModal}
          match={match}
          t={t}
          history={history}
          isAddCardPath={isAddCardPath}
          country={merchantCountry}
          cartSummary={cartBilling}
          storeInfoForCleverTap={storeInfoForCleverTap}
          supportSaveCard={supportSaveCard}
          paymentExtraData={this.getPaymentEntryRequestData()}
        />
      </Elements>
    );
  }
}
Stripe.displayName = 'Stripe';

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => {
      return {
        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        cartBilling: getCartBilling(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        merchantCountry: getMerchantCountry(state),
        user: getUser(state),
        paymentProvider: getSelectedPaymentProvider(state),
        supportSaveCard: getSelectedPaymentOptionSupportSaveCard(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      paymentsActions: bindActionCreators(paymentCommonThunks, dispatch),
    })
  )
)(Stripe);
