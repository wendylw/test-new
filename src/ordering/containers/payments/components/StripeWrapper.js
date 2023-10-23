import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import i18next from 'i18next';
import { alert } from '../../../../common/feedback';
import { PATH_NAME_MAPPING } from '../../../../common/utils/constants';
import CleverTap from '../../../../utils/clevertap';
import logger from '../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../utils/monitoring/constants';

const MY_STRIPE_KEY = process.env.REACT_APP_PAYMENT_STRIPE_MY_KEY || '';
const SG_STRIPE_KEY = process.env.REACT_APP_PAYMENT_STRIPE_SG_KEY || '';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const getStripePromise = country => {
  CleverTap.pushEvent('Stripe - start loading', { timeStamp: new Date().getTime() });

  return loadStripe(country === 'SG' ? SG_STRIPE_KEY : MY_STRIPE_KEY)
    .then(stripe => {
      window.newrelic?.addPageAction('third-party-lib.load-script-succeeded', {
        scriptName: 'stripe',
        country,
      });
      return stripe;
    })
    .catch(err => {
      window.newrelic?.addPageAction('third-party-lib.load-script-failed', {
        scriptName: 'stripe',
        error: err?.message,
        country,
      });

      logger.error(
        'Ordering_StripeCreditCard_InitializeFailed',
        {
          message: `Failed to load stripe.js in ${country}`,
          country,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.CHECKOUT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SELECT_PAYMENT_METHOD,
          },
        }
      );

      alert(i18next.t('GotoPaymentFailedDescription'), {
        onClose: () => {
          window.location.href = `${window.location.origin}${PATH_NAME_MAPPING.ORDERING_BASE}${PATH_NAME_MAPPING.ORDERING_CART}${window.location.search}`;
        },
        style: { zIndex: '300' },
      });

      // WB-6503: Stripe Elements only accept a Stripe object or a Promise resolving to a Stripe object.
      // We are allowed to pass in `null` or a Promise resolving to `null` to `Elements` component, otherwise, it will throw an error.
      // Refer: https://stripe.com/docs/stripe-js/react#elements-provider
      return null;
    });
};

export default (WrappedComponent, { withRef = false } = {}) => {
  if (withRef) {
    const StripeWrapperWithRef = React.forwardRef((props, ref) => {
      const { merchantCountry } = props || {};
      const [stripePromise, setStripePromise] = useState(null);
      useEffect(() => {
        setStripePromise(getStripePromise(merchantCountry));
      }, [merchantCountry]);

      if (!stripePromise) {
        return null;
      }

      return (
        /* eslint-disable react/jsx-props-no-spreading */
        // eslint-disable-next-line react/jsx-filename-extension
        <WrappedComponent stripePromise={stripePromise} {...props} ref={ref} />
      );
    });

    StripeWrapperWithRef.displayName = 'StripeWrapperWithRef';

    return StripeWrapperWithRef;
  }

  const StripeWrapper = props => {
    const { merchantCountry } = props || {};
    const [stripePromise, setStripePromise] = useState(null);
    useEffect(() => {
      setStripePromise(getStripePromise(merchantCountry));
    }, [merchantCountry]);

    if (!stripePromise) {
      return null;
    }

    return (
      /* eslint-disable react/jsx-props-no-spreading */
      // eslint-disable-next-line react/jsx-filename-extension
      <WrappedComponent stripePromise={stripePromise} {...props} />
    );
  };

  StripeWrapper.displayName = 'StripeWrapper';

  return StripeWrapper;
};
