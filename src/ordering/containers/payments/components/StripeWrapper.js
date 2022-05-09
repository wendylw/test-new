import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import i18next from 'i18next';
import { alert } from '../../../../common/feedback';
import { PATH_NAME_MAPPING } from '../../../../common/utils/constants';

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
    window.newrelic?.addPageAction('common.stripe-load-failure', {
      error: err?.message,
      country: 'MY',
    });

    alert(i18next.t('GotoPaymentFailedDescription'), {
      onClose: () => {
        window.location.href = `${window.location.origin}${PATH_NAME_MAPPING.ORDERING_BASE}${PATH_NAME_MAPPING.ORDERING_ONLINE_SAVED_CARDS}${window.location.search}`;
      },
    });
  });
const stripeSGPromise = loadStripe(SG_STRIPE_KEY)
  .then(stripe => {
    window.newrelic?.addPageAction('common.stripe-load-success', {
      country: 'SG',
    });
    return stripe;
  })
  .catch(err => {
    window.newrelic?.addPageAction('common.stripe-load-failure', {
      error: err?.message,
      country: 'SG',
    });

    alert(i18next.t('GotoPaymentFailedDescription'), {
      onClose: () => {
        window.location.href = `${window.location.origin}${PATH_NAME_MAPPING.ORDERING_BASE}${PATH_NAME_MAPPING.ORDERING_ONLINE_SAVED_CARDS}${window.location.search}`;
      },
    });
  });

export default (WrappedComponent, { withRef = false }) => {
  if (withRef) {
    const StripeWrapperWithRef = React.forwardRef((props, ref) => (
      /* eslint-disable react/jsx-props-no-spreading */
      // eslint-disable-next-line react/jsx-filename-extension
      <WrappedComponent stripeMYPromise={stripeMYPromise} stripeSGPromise={stripeSGPromise} {...props} ref={ref} />
    ));

    StripeWrapperWithRef.displayName = 'StripeWrapperWithRef';

    return StripeWrapperWithRef;
  }

  const StripeWrapper = props => (
    /* eslint-disable react/jsx-props-no-spreading */
    // eslint-disable-next-line react/jsx-filename-extension
    <WrappedComponent stripeMYPromise={stripeMYPromise} stripeSGPromise={stripeSGPromise} {...props} />
  );

  StripeWrapper.displayName = 'StripeWrapper';

  return StripeWrapper;
};
