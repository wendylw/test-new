// import React, { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import {
//   CardElement,
//   CardNumberElement,
//   CardExpiryElement,
//   CardCvcElement,
//   Elements,
//   useElements,
//   useStripe,
// } from '@stripe/react-stripe-js';
// // import '../styles/2-Card-Detailed.css';

// const CARD_OPTIONS = {
//   iconStyle: 'solid',
//   style: {
//     base: {
//       iconColor: '#c4f0ff',
//       color: '#fff',
//       fontWeight: 500,
//       fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
//       fontSize: '16px',
//       fontSmoothing: 'antialiased',
//       ':-webkit-autofill': {
//         color: '#fce883',
//       },
//       '::placeholder': {
//         color: '#87bbfd',
//       },
//     },
//     invalid: {
//       iconColor: '#ffc7ee',
//       color: '#ffc7ee',
//     },
//   },
// };

// const CardField = ({ onChange }) => (
//   <div className="FormRow">
//     <CardElement options={CARD_OPTIONS} onChange={onChange} />
//   </div>
// );

// const ELEMENTS_OPTIONS = {
//   fonts: [
//     {
//     },
//   ],
// };

// // Make sure to call `loadStripe` outside of a component’s render to avoid
// // recreating the `Stripe` object on every render.
// const stripePromise = loadStripe('pk_test_c1feolngsqL68jkzxIl7mPui00ANmwtZHb');

// const StripePayment = () => {
//   return (
//     <div className="AppWrapper">
//       <Elements stripe={stripePromise} options={ELEMENTS_OPTIONS}>
//         <CheckoutForm />
//       </Elements>
//     </div>
//   );
// };

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

const CheckoutForm = () => {
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

    const payload = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardNumberElement),
      billing_details: billingDetails,
    });

    console.log(payload);

    setProcessing(false);

    if (payload.error) {
      setError(payload.error);
    } else {
      setPaymentMethod(payload.paymentMethod);
    }
  };

  return paymentMethod ? (
    <div className="Result">
      <div className="ResultTitle" role="alert">
        Payment successful
      </div>
      <div className="ResultMessage">
        Thanks for trying Stripe Elements. No money was charged, but we generated a PaymentMethod: {paymentMethod.id}
      </div>
    </div>
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

class CreditCard extends Component {
  state = {
    payNowLoading: false,
  };

  componentDidMount() {}

  getPaymentEntryRequestData = () => {
    const { history, onlineStoreInfo, currentOrder, business, merchantCountry } = this.props;
    const currentPayment = Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY;
    const { card } = this.state;
    const { cardholderName } = card || {};
    const h = config.h();
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const queryString = `?h=${encodeURIComponent(h)}`;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || !cardholderName || !window.encryptedCardData) {
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
    const { t, match, history, cartSummary } = this.props;
    const { payNowLoading, domLoaded } = this.state;
    const { total } = cartSummary || {};
    const paymentData = this.getPaymentEntryRequestData();

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
          <CheckoutForm />
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

        {paymentData ? (
          <RedirectForm
            ref={ref => (this.form = ref)}
            action={config.storeHubPaymentEntryURL}
            method="POST"
            data={paymentData}
          />
        ) : null}

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
)(CreditCard);
