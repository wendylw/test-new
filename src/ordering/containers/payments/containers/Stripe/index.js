import React, { Component } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import prefetch from '../../../../../common/utils/prefetch-assets';
import Constants from '../../../../../utils/constants';
import { bindActionCreators, compose } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusiness,
  getMerchantCountry,
  getUser,
  getBusinessInfo,
} from '../../../../redux/modules/app';
import {
  getCleverTapAttributes,
  getSelectedPaymentOptionSupportSaveCard,
  getSelectedPaymentProvider,
  getTotal,
  getReceiptNumber,
} from '../../redux/common/selectors';
import { initialize as initializeThunkCreator } from '../../redux/common/thunks';
import '../../styles/PaymentCreditCard.scss';
import StripeWrapper from '../../components/StripeWrapper';
import CheckoutForm from './CheckoutForm';

const { PAYMENT_PROVIDERS, ROUTER_PATHS, PAYMENT_METHOD_LABELS } = Constants;

// React Stripe.js reference: https://stripe.com/docs/stripe-js/react
class Stripe extends Component {
  async componentDidMount() {
    prefetch(['ORD_PMT', 'ORD_PL'], ['OrderingPayment']);

    this.props.initialize(PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY);
  }

  getPaymentEntryRequestData = () => {
    const { user } = this.props;

    return {
      paymentProvider: PAYMENT_PROVIDERS.STRIPE,
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
      total,
      merchantCountry,
      supportSaveCard,
      cleverTapAttributes,
      receiptNumber,
      stripePromise,
    } = this.props;
    const isAddCardPath = ROUTER_PATHS.ORDERING_STRIPE_PAYMENT_SAVE === history.location.pathname;

    return (
      <Elements stripe={stripePromise} options={{}}>
        <CheckoutForm
          match={match}
          t={t}
          history={history}
          isAddCardPath={isAddCardPath}
          country={merchantCountry}
          total={total}
          receiptNumber={receiptNumber}
          cleverTapAttributes={cleverTapAttributes}
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
        total: getTotal(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        merchantCountry: getMerchantCountry(state),
        user: getUser(state),
        paymentProvider: getSelectedPaymentProvider(state),
        supportSaveCard: getSelectedPaymentOptionSupportSaveCard(state),
        cleverTapAttributes: getCleverTapAttributes(state),
        receiptNumber: getReceiptNumber(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      initialize: bindActionCreators(initializeThunkCreator, dispatch),
    })
  )
)(StripeWrapper(Stripe));
