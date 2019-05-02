const ROUTER_PATHS = {
    INDEX: '/',
    HOME: '/home',
    PORDUCTS: '/products',
    CART: '/cart',
    PAYMENT: '/payment',
    THANK_YOU: '/thank-you',
    PLAYGROUND: 'playground',
};

const PAYMENT_METHODS = {
  GRAB_PAY: 'grabpay',
  BOOST_PAY: 'boost',
};

const ADD_TO_CART_MIN_QUANTITY = 1;

const BACKEND_PING_PATH = '/ping';

const PeopleCount = {
  DEFAULT: 1,
  MAX: 10,
  MAX_PLUS: -1,
}

export default {
    ROUTER_PATHS,
    PAYMENT_METHODS,
    ADD_TO_CART_MIN_QUANTITY,
    BACKEND_PING_PATH,
    PeopleCount,
}
