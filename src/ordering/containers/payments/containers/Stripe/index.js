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
  getInitPaymentRequestErrorMessage,
  getIsInitPaymentRequestStatusRejected,
} from '../../redux/common/selectors';
import { initialize as initializeThunkCreator } from '../../redux/common/thunks';
import '../../styles/PaymentCreditCard.scss';
import StripeWrapper from '../../components/StripeWrapper';
import CheckoutForm from './CheckoutForm';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';

const { PAYMENT_PROVIDERS, ROUTER_PATHS, PAYMENT_METHOD_LABELS } = Constants;

// React Stripe.js reference: https://stripe.com/docs/stripe-js/react
class Stripe extends Component {
  async componentDidMount() {
    await this.props.initialize(PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY);

    const { isInitPaymentFailed, initPaymentErrorMessage } = this.props;

    if (isInitPaymentFailed) {
      logger.error(
        'Ordering_StripeCreditCard_InitializeFailed',
        {
          message: initPaymentErrorMessage,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.CHECKOUT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SELECT_PAYMENT_METHOD,
          },
        }
      );
    }

    prefetch(['ORD_PMT'], ['OrderingPayment']);
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
        initPaymentErrorMessage: getInitPaymentRequestErrorMessage(state),
        isInitPaymentFailed: getIsInitPaymentRequestStatusRejected(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      initialize: bindActionCreators(initializeThunkCreator, dispatch),
    })
  )
)(StripeWrapper(Stripe));
