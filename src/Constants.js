const ROUTER_PATHS = {
    INDEX: '/',
    HOME: '/home',
    PORDUCTS: '/products',
    CART: '/cart',
    PAYMENT: '/payment',
    THANK_YOU: '/thank-you',
    SORRY: '/sorry',
    PLAYGROUND: 'playground',
    ERROR: '/error',
};

const PAYMENT_METHODS = {
  GRAB_PAY: 'GrabPay',
  BOOST_PAY: 'Boost',
};

const ADD_TO_CART_MIN_QUANTITY = 1;

const BACKEND_PING_PATH = '/ping';

const PeopleCount = {
  DEFAULT: 1,
  MAX: 12,
  MAX_PLUS: -1,
}

export default {
    ROUTER_PATHS,
    PAYMENT_METHODS,
    ADD_TO_CART_MIN_QUANTITY,
    BACKEND_PING_PATH,
    PeopleCount,
}
