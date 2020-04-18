import qs from 'qs';
import React, { Component, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Loader from '../components/Loader';
import Header from '../../../../components/Header';
import Constants from '../../../../utils/constants';
import CurrencyNumber from '../../../components/CurrencyNumber';
import RedirectForm from '../components/RedirectForm';
import config from '../../../../config';

import { bindActionCreators, compose } from 'redux';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { getOnlineStoreInfo, getBusiness, getMerchantCountry } from '../../../redux/modules/app';
import { actions as paymentActionCreators, getCurrentOrderId } from '../../../redux/modules/payment';
import Utils from '../../../../utils/utils';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_c1feolngsqL68jkzxIl7mPui00ANmwtZHb');

const Field = ({
  label,
  formClassName,
  inputClassName,
  id,
  type,
  placeholder,
  required,
  autoComplete,
  value,
  onChange,
}) => (
  <div className={formClassName}>
    <label htmlFor={id} className="payment-bank__label font-weight-bold">
      {label}
    </label>
    <input
      className={inputClassName}
      id={id}
      type={type}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
    />
  </div>
);

const ErrorMessage = ({ children }) => (
  <div className="ErrorMessage" role="alert">
    {children}
  </div>
);

const SubmitButton = ({ processing, error, children, disabled }) => (
  <button
    className={`SubmitButton ${error ? 'SubmitButton--error' : ''}`}
    type="submit"
    disabled={processing || disabled}
  >
    {processing ? 'Processing...' : children}
  </button>
);

const CheckoutForm = ({ renderRedirectForm, onPreSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [billingDetails, setBillingDetails] = useState({
    // email: '',
    // phone: '',
    name: '',
  });
  const cardComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete;

  if (typeof renderRedirectForm !== 'function') {
    throw new Error('Error: getRedirectFrom should be a function');
  }

  const redirectForm = renderRedirectForm();

  console.log('[Stripe] redirectForm =', redirectForm);

  const handleSubmit = async event => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    if (error) {
      elements.getElement('card').focus();
      return;
    }

    if (cardComplete) {
      setProcessing(true);
    }

    await onPreSubmit();

    const payload = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardNumberElement),
      billing_details: billingDetails,
    });

    console.log('[Stripe] stripe.createPaymentMethod() => ', payload);

    setProcessing(false);

    if (payload.error) {
      setError(payload.error);
    } else {
      setPaymentMethod(payload.paymentMethod);
    }
  };

  return paymentMethod ? (
    renderRedirectForm(paymentMethod)
  ) : (
    <form className="Form" onSubmit={handleSubmit}>
      <CardNumberElement
        onChange={e => {
          setError(e.error);
          setCardNumberComplete(e.complete);
        }}
      />

      <CardExpiryElement
        onChange={e => {
          setError(e.error);
          setCardExpiryComplete(e.complete);
        }}
      />

      <CardCvcElement
        onChange={e => {
          setError(e.error);
          setCardCvcComplete(e.complete);
        }}
      />

      <Field
        label="Name"
        id="name"
        type="text"
        required
        autoComplete="name"
        value={billingDetails.name}
        onChange={e => {
          setBillingDetails({ ...billingDetails, name: e.target.value });
        }}
      />
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <SubmitButton processing={processing} error={error} disabled={!stripe}>
        Pay $25
      </SubmitButton>
    </form>
  );
};

class Stripe extends Component {
  state = {
    payNowLoading: false,
  };

  componentDidMount() {
    this.props.homeActions.loadShoppingCart();
  }

  createOrder = async () => {
    const { history, paymentActions, cartSummary } = this.props;
    const { totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    await paymentActions.createOrder({ cashback: totalCashback, shippingType: type });

    const { currentOrder } = this.props;
    const { orderId } = currentOrder || {};

    if (orderId) {
      Utils.removeSessionVariable('additionalComments');
      Utils.removeSessionVariable('deliveryComments');
    }
  };

  getPaymentEntryRequestData = () => {
    const { history, onlineStoreInfo, currentOrder, business, merchantCountry } = this.props;
    const currentPayment = Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY;
    const h = config.h();
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const queryString = `?h=${encodeURIComponent(h)}`;

    console.log('[Stripe] { onlineStoreInfo, currentOrder, currentPayment } => ', {
      onlineStoreInfo,
      currentOrder,
      currentPayment,
    });

    if (!onlineStoreInfo || !currentOrder || !currentPayment) {
      return null;
    }

    const redirectURL = `${config.storehubPaymentResponseURL.replace('%business%', business)}${queryString}${
      type ? '&type=' + type : ''
    }`;
    const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('%business%', business)}${queryString}`;

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL,
      webhookURL,
      paymentName: 'Stripe',
      paymentMethodId: '',
    };
  };

  render() {
    const { t, match, history } = this.props;

    return (
      <section className={`table-ordering__bank-payment ${match.isExact ? '' : 'hide'}`}>
        <Header
          className="border__bottom-divider gray has-right"
          isPage={true}
          title={t('PayViaCard')}
          navFunc={() => {
            history.replace({
              pathname: Constants.ROUTER_PATHS.ORDERING_PAYMENT,
              search: window.location.search,
            });
          }}
        />

        <Elements stripe={stripePromise} options={{}}>
          <CheckoutForm
            onPreSubmit={this.createOrder}
            renderRedirectForm={paymentMethod => {
              if (!paymentMethod) return null;

              const requestData = { ...this.getPaymentEntryRequestData(), paymentMethodId: paymentMethod.id };

              // todo: remove this before deploy
              console.log('requestData =', requestData);
              return null;

              return requestData ? (
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

        {/* <div className="footer-operation">
          <button
            className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
            onClick={this.payNow.bind(this)}
            disabled={payNowLoading}
          >
            {payNowLoading ? (
              <div className="loader"></div>
            ) : (
                <CurrencyNumber className="font-weight-bold text-center" addonBefore={t('Pay')} money={total || 0} />
              )}
          </button>
        </div> */}

        {/* <Loader loaded={domLoaded} /> */}
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
        business: getBusiness(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        merchantCountry: getMerchantCountry(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(Stripe);
