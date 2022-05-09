import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useTranslation } from 'react-i18next';
import { alert } from '../../../../common/feedback';

const MY_STRIPE_KEY = process.env.REACT_APP_PAYMENT_STRIPE_MY_KEY || '';
const SG_STRIPE_KEY = process.env.REACT_APP_PAYMENT_STRIPE_SG_KEY || '';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripeMYPromise = loadStripe(MY_STRIPE_KEY)
  .then(stripe => {
    window.newrelic?.addPageAction('common.stripe-load-success', {
      country: 'MY',
    });
    return stripe;
  })
  .catch(err => {
    const { t } = useTranslation();

    alert(t('GotoPaymentFailedDescription'), {
      onClose: () => window.location.reload(),
    });

    window.newrelic?.addPageAction('common.stripe-load-failure', {
      error: err?.message,
      country: 'MY',
    });

    throw err;
  });
const stripeSGPromise = loadStripe(SG_STRIPE_KEY)
  .then(stripe => {
    window.newrelic?.addPageAction('common.stripe-load-success', {
      country: 'SG',
    });
    return stripe;
  })
  .catch(err => {
    const { t } = useTranslation();

    alert(t('GotoPaymentFailedDescription'), {
      onClose: () => window.location.reload(),
    });

    window.newrelic?.addPageAction('common.stripe-load-failure', {
      error: err?.message,
      country: 'SG',
    });
    throw err;
  });

export default WrappedComponent => {
  const StripeWrapper = props => (
    /* eslint-disable react/jsx-props-no-spreading */
    // eslint-disable-next-line react/jsx-filename-extension
    <WrappedComponent stripeMYPromise={stripeMYPromise} stripeSGPromise={stripeSGPromise} {...props} />
  );
  StripeWrapper.displayName = 'StripeWrapper';

  return StripeWrapper;
};
