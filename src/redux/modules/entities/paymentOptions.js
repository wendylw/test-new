import Constants from '../../../utils/constants';

const { PAYMENT_METHOD_LABELS, ROUTER_PATHS } = Constants;

const initialState = {
  data: {
    stripe: {
      key: 'stripe',
      logo: 'paymentCreditImage',
      label: PAYMENT_METHOD_LABELS.STRIPE,
      pathname: ROUTER_PATHS.ORDERING_STRIPE_PAYMENT,
    },
    onlineBanking: {
      key: 'onlineBanking',
      logo: 'paymentBankingImage', // refer to imports in file PaymentLogo/index.js
      label: PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY,
      pathname: ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT,
    },
    creditCard: {
      key: 'creditCard',
      logo: 'paymentCreditImage', // refer to imports in file PaymentLogo/index.js
      label: PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY,
      pathname: ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT,
    },
    boost: {
      key: 'boost',
      logo: 'paymentBoostImage', // refer to imports in file PaymentLogo/index.js
      label: PAYMENT_METHOD_LABELS.BOOST_PAY,
    },
    grabPay: {
      key: 'grabPay',
      logo: 'paymentGrabImage', // refer to imports in file PaymentLogo/index.js
      label: PAYMENT_METHOD_LABELS.GRAB_PAY,
    },
    TNG: {
      key: 'TNG',
      logo: 'paymentTNGImage', // refer to imports in file PaymentLogo/index.js
      label: PAYMENT_METHOD_LABELS.TNG_PAY,
    },
    gcash: {
      logo: paymentGcashImage,
      label: PAYMENT_METHOD_LABELS.GCASH_PAY,
    },
  },
};

const reducer = (state = initialState, action) => {
  return state;
};

export default reducer;

// @selectors
export const getAllPaymentOptions = state => state.entities.paymentOptions.data;
