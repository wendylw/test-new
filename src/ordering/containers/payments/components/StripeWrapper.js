import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import i18next from 'i18next';
import { alert } from '../../../../common/feedback';
import { PATH_NAME_MAPPING } from '../../../../common/utils/constants';
import CleverTap from '../../../../utils/clevertap';
import logger from '../../../../utils/monitoring/logger';

const MY_STRIPE_KEY = process.env.REACT_APP_PAYMENT_STRIPE_MY_KEY || '';
const SG_STRIPE_KEY = process.env.REACT_APP_PAYMENT_STRIPE_SG_KEY || '';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const getStripePromise = country => {
  CleverTap.pushEvent('Stripe - start loading', { timeStamp: new Date().getTime() });

  return loadStripe(country === 'SG' ? SG_STRIPE_KEY : MY_STRIPE_KEY)
    .then(stripe => {
      window.newrelic?.addPageAction('common.stripe-load-success', {
        country,
      });
      return stripe;
    })
    .catch(err => {
      window.newrelic?.addPageAction('common.stripe-load-failure', {
        error: err?.message,
        country,
      });

      logger.error('common.stripe-load-failure', {
        error: err?.message,
        country,
      });

      alert(i18next.t('GotoPaymentFailedDescription'), {
        onClose: () => {
          window.location.href = `${window.location.origin}${PATH_NAME_MAPPING.ORDERING_BASE}${PATH_NAME_MAPPING.ORDERING_CART}${window.location.search}`;
        },
        containerClassName: 'tw-z-300',
      });
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
