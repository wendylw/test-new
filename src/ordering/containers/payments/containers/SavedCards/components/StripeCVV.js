import React, { useImperativeHandle, forwardRef, useState, Fragment } from 'react';
import { Elements, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CVCCardImage from '../../../../../../images/cvc-card.png';
import _isFunction from 'lodash/isFunction';
import _get from 'lodash/get';

const MY_STRIPE_KEY = process.env.REACT_APP_PAYMENT_STRIPE_MY_KEY || '';
const SG_STRIPE_KEY = process.env.REACT_APP_PAYMENT_STRIPE_SG_KEY || '';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripeMYPromise = loadStripe(MY_STRIPE_KEY)
  .then(stripe => {
    window.newrelic?.addPageAction('common.stripe-load-success');
    return stripe;
  })
  .catch(err => {
    window.newrelic?.addPageAction('common.stripe-load-failure');
    throw err;
  });
const stripeSGPromise = loadStripe(SG_STRIPE_KEY)
  .then(stripe => {
    window.newrelic?.addPageAction('common.stripe-load-success');
    return stripe;
  })
  .catch(err => {
    window.newrelic?.addPageAction('common.stripe-load-failure');
    throw err;
  });

const CVVInput = forwardRef((props, ref) => {
  const { onReady, onChange } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  useImperativeHandle(ref, () => ({
    getCvcToken: async () => {
      try {
        const cardCvc = elements.getElement(CardCvcElement);
        const result = await stripe.createToken('cvc_update', cardCvc);
        setErrorMessage(_get(result, 'error.message', null));
        return result;
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message);
        return null;
      }
    },
  }));

  const cardCvcProps = {
    options: {
      style: {
        base: {
          lineHeight: '56px',
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
    },
    onChange: async event => {
      setErrorMessage(_get(event, 'error.message', null));

      if (_isFunction(onChange)) {
        onChange(event);
      }
    },

    onReady: () => {
      if (_isFunction(onReady)) {
        onReady();
      }
    },
  };

  return (
    <Fragment>
      <div
        style={{
          borderColor: errorMessage && '#fa4133',
        }}
        className="stripe-cvc-input-wrapper"
      >
        <CardCvcElement {...cardCvcProps} />
        <div className="stripe-cvc-card-image">
          <img alt="CVC" src={CVCCardImage} />
        </div>
      </div>
      {errorMessage && (
        <div className="form__error-message padding-left-right-normal margin-top-bottom-small" role="alert">
          {errorMessage}
        </div>
      )}
    </Fragment>
  );
});

const StripeCVV = forwardRef((props, ref) => {
  const { merchantCountry } = props;

  return (
    <Elements stripe={merchantCountry === 'SG' ? stripeSGPromise : stripeMYPromise}>
      <CVVInput ref={ref} {...props} />
    </Elements>
  );
});

export default StripeCVV;
