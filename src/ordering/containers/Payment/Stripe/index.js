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
import CreateOrderButton from '../../../components/CreateOrderButton';
import RedirectForm from '../components/RedirectForm';
import config from '../../../../config';

import { bindActionCreators, compose } from 'redux';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getOrderByOrderId } from '../../../../redux/modules/entities/orders';
import { getOnlineStoreInfo, getBusiness, getMerchantCountry } from '../../../redux/modules/app';
import { actions as paymentActionCreators, getCurrentOrderId } from '../../../redux/modules/payment';
import Utils from '../../../../utils/utils';
import PaymentCardBrands from '../components/PaymentCardBrands';
// import '../styles/2-Card-Detailed.css';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripeMYPromise = loadStripe(process.env.REACT_APP_PAYMENT_STRIPE_MY_KEY || '');
const stripeSGPromise = loadStripe(process.env.REACT_APP_PAYMENT_STRIPE_SG_KEY || '');

const Field = ({
  t,
  label,
  formClassName,
  inputClassName,
  id,
  type,
  placeholder,
  required,
  autoComplete,
  isNotNameComplete,
  isFormTouched,
  value,
  onChange,
}) => (
  <div className={formClassName}>
    <div className="flex flex-middle flex-space-between">
      <label htmlFor={id} className="payment-bank__label font-weight-bolder">
        {label}
      </label>
      {isFormTouched && isNotNameComplete ? (
        <span className="error-message font-weight-bolder text-uppercase">{t('RequiredMessage')}</span>
      ) : null}
    </div>
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
  <div className="error-message__container has-error" role="alert">
    {children}
  </div>
);

const CheckoutForm = ({ t, renderRedirectForm, history, cartSummary, country }) => {
  const { total } = cartSummary || {};
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [cardBrand, setCardBrand] = useState('');
  const [cardNumberDomLoaded, setCardNumberDom] = useState(false);
  const [cardExpiryDomLoaded, setCardExpiryDom] = useState(false);
  const [cardCVCDomLoaded, setCardCVCDom] = useState(false);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isFormTouched, setIsFormTouched] = useState(false);
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
  };

  const isNotCardComplete = !cardNumberComplete && !cardExpiryComplete && !cardCvcComplete;

  const isNotNameComplete = !Boolean(billingDetails.name);

  const renderFieldErrorMessage = () => {
    if (error.code === 'invalid_number') {
      return t('CardNumberInvalidMessage');
    } else if (error.code === 'incomplete_number') {
      return t('CardNumberStringIncompleteMessage');
    } else if (error.code === 'incomplete_expiry') {
      return t('CardExpiryIncompleteMessage');
    } else if (error.code === 'incomplete_cvc') {
      return t('CardCVCIncompleteMessage');
    }
  };

  // 'onfocus', (e ) => e.target.checkValidity()

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="flex flex-middle flex-space-between">
        <label className="payment-bank__label font-weight-bolder">{t('CardInformation')}</label>
        {isFormTouched && isNotCardComplete ? (
          <span className="error-message font-weight-bolder text-uppercase">{t('RequiredMessage')}</span>
        ) : null}
      </div>
      <div
        className={`input__list-top${
          (isFormTouched && isNotCardComplete) ||
          (error && (error.code === 'invalid_number' || error.code === 'incomplete_number'))
            ? ' has-error'
            : ''
        }`}
        style={{
          height: '50px',
          padding: '12px',
        }}
      >
        <CardNumberElement
          options={{
            style: {
              base: {
                height: '50px',
                color: '#303030',
                fontWeight: 500,
                fontSize: '1.3rem',
                fontSmoothing: 'antialiased',
                ':-webkit-autofill': {
                  color: '#dededf',
                },
                '::placeholder': {
                  color: '#dededf',
                },
              },
              invalid: {
                color: '#ff5821',
              },
            },
          }}
          onChange={e => {
            setError(e.error);
            // Card brand. Can be American Express, Diners Club, Discover, JCB, MasterCard, UnionPay, Visa, or Unknown.
            // The card brand of the card number being entered.
            // Can be one of visa, mastercard, amex, discover, diners, jcb, unionpay, or unknown.
            setCardBrand(e.brand);
            setCardNumberComplete(e.complete);
          }}
          onReady={e => {
            setCardNumberDom(true);
          }}
        />
        <PaymentCardBrands
          iconClassName={'payment-bank__card-type-icon'}
          country={country}
          brand={cardBrand}
          vendor={PaymentCardBrands.VENDOR_STRIPE}
        />
      </div>

      <div className="input__list-bottomn">
        <div
          style={{
            display: 'inline-block',
            height: '50px',
            width: '50%',
            padding: '12px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor:
              (isFormTouched && isNotCardComplete) || (error && error.code === 'incomplete_expiry')
                ? '#ff5821'
                : '#dededf',
            borderBottomLeftRadius: '4px',
            transform: 'translateY(-1px)',
          }}
        >
          <CardExpiryElement
            options={{
              style: {
                base: {
                  height: '50px',
                  color: '#303030',
                  fontWeight: 500,
                  fontSize: '1.3rem',
                  fontSmoothing: 'antialiased',
                  ':-webkit-autofill': {
                    color: '#dededf',
                  },
                  '::placeholder': {
                    color: '#dededf',
                  },
                },
                invalid: {
                  color: '#ff5821',
                },
              },
            }}
            onChange={e => {
              setError(e.error);
              setCardExpiryComplete(e.complete);
            }}
            onReady={e => {
              setCardExpiryDom(true);
            }}
          />
        </div>
        <div
          style={{
            display: 'inline-block',
            height: '50px',
            width: '50%',
            padding: '12px',
            borderWidth: error && error.code === 'incomplete_cvc' ? '1px' : '1px 1px 1px 0',
            borderStyle: 'solid',
            borderColor:
              (isFormTouched && isNotCardComplete) || (error && error.code === 'incomplete_cvc')
                ? '#ff5821'
                : '#dededf',
            borderBottomRightRadius: '4px',
            transform: 'translateY(-1px)',
          }}
        >
          <CardCvcElement
            options={{
              style: {
                base: {
                  height: '50px',
                  color: '#303030',
                  fontWeight: 500,
                  fontSize: '1.3rem',
                  fontSmoothing: 'antialiased',
                  ':-webkit-autofill': {
                    color: '#dededf',
                  },
                  '::placeholder': {
                    color: '#dededf',
                  },
                },
                invalid: {
                  color: '#ff5821',
                },
              },
            }}
            onChange={e => {
              setError(e.error);
              setCardCvcComplete(e.complete);
            }}
            onReady={e => {
              setCardCVCDom(true);
            }}
          />
        </div>
        {error && <ErrorMessage>{renderFieldErrorMessage()}</ErrorMessage>}
      </div>

      <Field
        t={t}
        label={t('NameOnCard')}
        formClassName="payment-bank__form-item"
        inputClassName={`input input__block border-radius-base${
          isFormTouched && isNotCardComplete ? ' has-error' : ''
        }`}
        id="name"
        type="text"
        required
        autoComplete="name"
        value={billingDetails.name}
        isNotNameComplete={isNotNameComplete}
        isFormTouched={isFormTouched}
        onChange={e => {
          setBillingDetails({ ...billingDetails, name: e.target.value });
        }}
      />
      <div className="footer-operation">
        <CreateOrderButton
          history={history}
          buttonType="submit"
          disabled={processing || !stripe}
          beforeCreateOrder={() => setIsFormTouched(true)}
          afterCreateOrder={async () => {
            const payload = await stripe.createPaymentMethod({
              type: 'card',
              card: elements.getElement(CardNumberElement),
              billing_details: billingDetails,
            });

            setProcessing(false);

            if (payload.error) {
              setError(payload.error);
            } else {
              setPaymentMethod(payload.paymentMethod);
            }
          }}
        >
          <CurrencyNumber className="font-weight-bolder text-center" addonBefore={t('Pay')} money={total || 0} />
        </CreateOrderButton>
      </div>
      {/* <SubmitButton processing={processing} error={error} disabled={!stripe} onClick={() => setIsFormTouched(true)}>
        <CurrencyNumber className="font-weight-bolder text-center" addonBefore={t('Pay')} money={total || 0} />
      </SubmitButton> */}

      {paymentMethod ? renderRedirectForm(paymentMethod) : null}

      <Loader loaded={cardNumberDomLoaded && cardExpiryDomLoaded && cardCVCDomLoaded} />
    </form>
  );
};

class Stripe extends Component {
  state = {
    payNowLoading: false,
    domLoaded: false,
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
    const { history, onlineStoreInfo, currentOrder, business } = this.props;
    const currentPayment = Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY;
    const h = config.h();
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const queryString = `?h=${encodeURIComponent(h)}`;

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
    const { t, match, history, cartSummary, merchantCountry } = this.props;
    const { total } = cartSummary || {};

    return (
      <section className={`table-ordering__bank-payment ${match.isExact ? '' : 'hide'}`}>
        <Header
          className="flex-middle border__bottom-divider gray has-right"
          isPage={true}
          title={t('PayViaCard')}
          navFunc={() => {
            history.replace({
              pathname: Constants.ROUTER_PATHS.ORDERING_PAYMENT,
              search: window.location.search,
            });
          }}
        />

        <div className="payment-bank stripe">
          <CurrencyNumber className="payment-bank__money font-weight-bolder text-center" money={total || 0} />

          <Elements stripe={merchantCountry === 'SG' ? stripeSGPromise : stripeMYPromise} options={{}}>
            <CheckoutForm
              t={t}
              history={history}
              country={merchantCountry}
              cartSummary={cartSummary}
              onPreSubmit={this.createOrder}
              renderRedirectForm={paymentMethod => {
                if (!paymentMethod) return null;

                const requestData = { ...this.getPaymentEntryRequestData(), paymentMethodId: paymentMethod.id };

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
        </div>
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
