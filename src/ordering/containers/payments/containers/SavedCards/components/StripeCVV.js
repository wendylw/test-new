import React, { useImperativeHandle, useState, Fragment } from 'react';
import { Elements, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import StripeWrapper from '../../../components/StripeWrapper';
import CleverTap from '../../../../../../utils/clevertap';
import CVCCardImage from '../../../../../../images/cvc-card.png';
import _isFunction from 'lodash/isFunction';
import _get from 'lodash/get';

const CVVInput = React.forwardRef((props, ref) => {
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
      CleverTap.pushEvent('Stripe - loaded', { timeStamp: new Date().getTime() });

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

CVVInput.displayName = 'CVVInput';

const StripeCVV = React.forwardRef((props, ref) => {
  const { stripePromise } = props;

  return (
    <Elements stripe={stripePromise} options={{ loader: 'always' }}>
      <CVVInput ref={ref} {...props} />
    </Elements>
  );
});
StripeCVV.displayName = 'StripeCVV';

export default StripeWrapper(StripeCVV, { withRef: true });
