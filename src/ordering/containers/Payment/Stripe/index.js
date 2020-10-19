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
import PaymentCardBrands from '../components/PaymentCardBrands';
import withDataAttributes from '../../../../components/withDataAttributes';
import { getPaymentRedirectAndWebHookUrl } from '../utils';
import '../PaymentCreditCard.scss';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripeMYPromise = loadStripe(process.env.REACT_APP_PAYMENT_STRIPE_MY_KEY || '');
const stripeSGPromise = loadStripe(process.env.REACT_APP_PAYMENT_STRIPE_SG_KEY || '');

const Field = withDataAttributes(
  ({
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
    dataAttributes,
  }) => (
    <div className={formClassName}>
      <div className="flex flex-middle flex-space-between padding-top-bottom-normal">
        <label htmlFor={id} className="text-size-bigger text-weight-bolder">
          {label}
        </label>
        {isFormTouched && isNotNameComplete ? (
          <span className="form__error-message text-weight-bolder text-uppercase">{t('RequiredMessage')}</span>
        ) : null}
      </div>
      <div className="form__group">
        <input
          className={inputClassName}
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          {...dataAttributes}
        />
      </div>
    </div>
  )
);

const ErrorMessage = ({ children }) => (
  <span className="form__error-message padding-left-right-normal margin-top-bottom-small" role="alert">
    {children}
  </span>
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
  const isFormComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete && billingDetails.name;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="padding-left-right-normal">
        <div className="flex flex-middle flex-space-between padding-top-bottom-normal">
          <label className="text-size-bigger text-weight-bolder">{t('CardInformation')}</label>
          {isFormTouched && isNotCardComplete ? (
            <span className="form__error-message text-weight-bolder text-uppercase">{t('RequiredMessage')}</span>
          ) : null}
        </div>
        <div
          className={`payment-credit-card__group-card-number padding-left-right-normal form__group ${
            (isFormTouched && isNotCardComplete) ||
            (error && (error.code === 'invalid_number' || error.code === 'incomplete_number'))
              ? ' error'
              : ''
          }`}
          data-heap-name="ordering.payment.stripe.card-number-wrapper"
        >
          <CardNumberElement
            options={{
              style: {
                base: {
                  lineHeight: '54px',
                  color: '#303030',
                  fontSize: '1.4285rem',
                  fontSmoothing: 'antialiased',
                  ':-webkit-autofill': {
                    color: '#dededf',
                  },
                  '::placeholder': {
                    color: '#dededf',
                  },
                },
                invalid: {
                  color: '#fa4133',
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
          <PaymentCardBrands country={country} brand={cardBrand} vendor={PaymentCardBrands.VENDOR_STRIPE} />
        </div>

        <div className="flex flex-middle">
          <div
            className="payment-credit-card__group-left-bottom form__group padding-left-right-normal"
            data-heap-name="ordering.payment.stripe.valid-date-wrapper"
            style={{
              width: '50%',
              borderColor:
                (isFormTouched && isNotCardComplete) || (error && error.code === 'incomplete_expiry')
                  ? '#fa4133'
                  : '#dededf',
            }}
          >
            <CardExpiryElement
              options={{
                style: {
                  base: {
                    lineHeight: '54px',
                    color: '#303030',
                    fontSize: '1.4285rem',
                    fontSmoothing: 'antialiased',
                    ':-webkit-autofill': {
                      color: '#dededf',
                    },
                    '::placeholder': {
                      color: '#dededf',
                    },
                  },
                  invalid: {
                    color: '#fa4133',
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
            className="payment-credit-card__group-right-bottom form__group padding-left-right-normal"
            style={{
              width: '50%',
              borderWidth: error && error.code === 'incomplete_cvc' ? '1px' : '1px 1px 1px 0',
              borderColor:
                (isFormTouched && isNotCardComplete) || (error && error.code === 'incomplete_cvc')
                  ? '#fa4133'
                  : '#dededf',
            }}
            data-heap-name="ordering.payment.stripe.cvc-wrapper"
          >
            <CardCvcElement
              options={{
                style: {
                  base: {
                    lineHeight: '54px',
                    color: '#303030',
                    fontSize: '1.4285rem',
                    fontSmoothing: 'antialiased',
                    ':-webkit-autofill': {
                      color: '#dededf',
                    },
                    '::placeholder': {
                      color: '#dededf',
                    },
                  },
                  invalid: {
                    color: '#fa4133',
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
        </div>
      </div>
      {error && <ErrorMessage>{renderFieldErrorMessage()}</ErrorMessage>}

      <Field
        t={t}
        label={t('NameOnCard')}
        formClassName="padding-normal"
        inputClassName={`payment-credit-card__input form__input padding-left-right-normal text-size-biggest ${
          isFormTouched && isNotCardComplete ? ' error' : ''
        }`}
        id="name"
        type="text"
        required
        autoComplete="name"
        data-heap-name="ordering.payment.stripe.holder-name"
        value={billingDetails.name}
        isNotNameComplete={isNotNameComplete}
        isFormTouched={isFormTouched}
        onChange={e => {
          setBillingDetails({ ...billingDetails, name: e.target.value });
        }}
      />

      <footer className="payment-credit-card__footer flex__shrink-fixed footer padding-top-bottom-small padding-left-right-normal">
        <CreateOrderButton
          className="margin-top-bottom-smaller"
          history={history}
          buttonType="submit"
          data-heap-name="ordering.payment.stripe.pay-btn"
          disabled={processing || !stripe}
          beforeCreateOrder={() => {
            setProcessing(true);
            setIsFormTouched(true);
          }}
          validCreateOrder={Boolean(isFormComplete)}
          afterCreateOrder={async orderId => {
            const payload = await stripe.createPaymentMethod({
              type: 'card',
              card: elements.getElement(CardNumberElement),
              billing_details: billingDetails,
            });

            setProcessing(!!orderId);

            if (payload.error) {
              setError(payload.error);
            } else {
              setPaymentMethod(payload.paymentMethod);
            }
          }}
        >
          <CurrencyNumber
            className="text-center text-weight-bolder text-uppercase"
            addonBefore={t('Pay')}
            money={total || 0}
          />
        </CreateOrderButton>
      </footer>

      {paymentMethod ? renderRedirectForm(paymentMethod) : null}

      <Loader
        className={'loading-cover opacity'}
        loaded={cardNumberDomLoaded && cardExpiryDomLoaded && cardCVCDomLoaded}
      />
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

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, business } = this.props;
    const currentPayment = Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY;

    if (!onlineStoreInfo || !currentOrder || !currentPayment) {
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
      paymentName: 'Stripe',
      paymentMethodId: '',
    };
  };

  render() {
    const { t, match, history, cartSummary, merchantCountry } = this.props;
    const { total } = cartSummary || {};

    return (
      <section
        className={`payment-credit-card flex flex-column ${match.isExact ? '' : 'hide'}`}
        data-heap-name="ordering.payment.stripe.container"
      >
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.payment.stripe.header"
          isPage={true}
          title={t('PayViaCard')}
          navFunc={() => {
            history.replace({
              pathname: Constants.ROUTER_PATHS.ORDERING_PAYMENT,
              search: window.location.search,
            });
          }}
        />

        <div className="payment-credit-card__container padding-top-bottom-normal">
          <div className="text-center padding-top-bottom-normal">
            <CurrencyNumber className="text-size-large text-weight-bolder" money={total || 0} />
          </div>

          <Elements stripe={merchantCountry === 'SG' ? stripeSGPromise : stripeMYPromise} options={{}}>
            <CheckoutForm
              t={t}
              history={history}
              country={merchantCountry}
              cartSummary={cartSummary}
              renderRedirectForm={paymentMethod => {
                if (!paymentMethod) return null;

                const requestData = { ...this.getPaymentEntryRequestData(), paymentMethodId: paymentMethod.id };
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
