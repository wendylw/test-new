export const API_REQUEST_URL_PATTERNS = {
  // v2 API
  '/api/ordering/stores/*': /^\/api\/ordering\/stores\/\w+$/,
  '/api/consumers/*/address': /^\/api\/consumers\/\w+\/address$/,
  '/api/consumers/*/profile': /^\/api\/consumers\/\w+\/profile$/,
  '/api/consumers/*/customer': /^\/api\/consumers\/\w+\/customer$/,
  '/api/consumers/*/vouchers': /^\/api\/consumers\/\w+\/vouchers$/,
  '/api/transactions/*/status': /^\/api\/transactions\/\w+\/status$/,
  '/api/transactions/*/review': /^\/api\/transactions\/\w+\/review$/,
  '/api/consumers/*/address/*': /^\/api\/consumers\/\w+\/address\/\w+$/,
  '/api/cashback/hash/*/decode': /^\/api\/cashback\/hash\/.+\/decode$/,
  '/api/consumers/*/transactions': /^\/api\/consumers\/\w+\/transactions$/,
  '/api/consumers/*/paymentMethods': /^\/api\/consumers\/\w+\/paymentMethods$/,
  '/api/consumers/*/store/*/address': /^\/api\/consumers\/\w+\/store\/\w+\/address$/,
  '/api/transactions/*/status/cancel': /^\/api\/transactions\/\w+\/status\/cancel$/,
  '/api/consumers/*/store/*/address/*': /^\/api\/consumers\/\w+\/store\/\w+\/address\/\w+$/,
  '/api/consumers/*/favorites/stores/*/status': /^\/api\/consumers\/\w+\/favorites\/stores\/\w+\/status$/,
  // v3 API
  '/api/v3/cart/items/*': /^\/api\/v3\/cart\/items\/\w+$/,
  '/api/v3/transactions/*': /^\/api\/v3\/transactions\/\w+$/,
  '/api/v3/consumers/*/profile': /^\/api\/v3\/consumers\/\w+\/profile$/,
  '/api/v3/food-courts/*/stores': /^\/api\/v3\/food-courts\/\w+\/stores$/,
  '/api/v3/consumers/*/customer': /^\/api\/v3\/consumers\/\w+\/customer$/,
  '/api/v3/transactions/*/status': /\/api\/v3\/transactions\/\w+\/status$/,
  '/api/v3/consumers/*/memberships': /^\/api\/v3\/consumers\/\w+\/memberships$/,
  '/api/v3/cart/submission/*/status': /\/api\/v3\/cart\/submission\/[a-zA-Z0-9-]+\/status$/,
  '/api/v3/transactions/*/submission': /\/api\/v3\/transactions\/\w+\/submission$/,
  '/api/v3/transactions/*/calculation': /\/api\/v3\/transactions\/\w+\/calculation$/,
  '/api/v3/transactions/*/status/cancel': /^\/api\/v3\/transactions\/\w+\/status\/cancel$/,
  '/api/v3/transactions/*/apply-cashback': /^\/api\/v3\/transactions\/\w+\/apply-cashback$/,
  '/api/v3/transactions/*/remove-cashback': /^\/api\/v3\/transactions\/\w+\/remove-cashback$/,
  '/api/v3/transactions/*/apply-voucher': /^\/api\/v3\/transactions\/\w+\/apply-voucher$/,
  '/api/v3/transactions/*/remove-voucher': /^\/api\/v3\/transactions\/\w+\/remove-voucher$/,
  '/api/v3/transactions/*/apply-promotions': /^\/api\/v3\/transactions\/\w+\/apply-promotions$/,
  '/api/v3/transactions/*/remove-promotions': /^\/api\/v3\/transactions\/\w+\/remove-promotions$/,
  '/api/v3/transactions/*/change-shipping-type': /^\/api\/v3\/transactions\/\w+\/change-shipping-type$/,
  '/api/v3/share-info-requests/*': /^\/api\/v3\/share-info-requests\/\w+$/,
  '/api/v3/share-info-requests/*/confirmation': /^\/api\/v3\/share-info-requests\/\w+\/confirmation$/,
  '/api/v3/consumers/*/unique-promos': /^\/api\/v3\/consumers\/\w+\/unique-promos$/,
  '/api/v3/consumers/*/unique-promos/banners': /^\/api\/v3\/consumers\/\w+\/unique-promos\/banners$/,
  '/api/v3/transactions/*/rewards': /^\/api\/v3\/transactions\/\w+\/rewards$/,
};

export const API_URL_WARNING_BYPASS_LIST = ['/api/gql/AddOrUpdateShoppingCartItem'];

/**
 * Flow & Step for key event logs
 * Please don't touch it if you don't understand what it stands for
 * Refer to: https://storehub.atlassian.net/wiki/spaces/TS/pages/2281734145/Beep+Web+Monitoring+-+Critical+Order+Flow+Summary
 */

export const KEY_EVENTS_FLOWS = {
  LOGIN: 'Login Flow',
  SELECTION: 'Selection Flow',
  CHECKOUT: 'Checkout Flow',
  PAYMENT: 'Payment Flow',
  REFUND: 'Refund Flow',
};

export const KEY_EVENTS_STEPS = {
  [KEY_EVENTS_FLOWS.LOGIN]: {
    SIGN_INTO_APP: 'Sign Into App',
    RECEIVE_OTP: 'Receive OTP',
    SUBMIT_OTP: 'Submit OTP',
  },
  [KEY_EVENTS_FLOWS.SELECTION]: {
    SELECT_ADDRESS: 'Select Address',
    SELECT_TIME_SLOT: 'Select Time Slot',
    VIEW_PRODUCTS: 'View Products',
    ADD_TO_CART: 'Add to cart',
  },
  [KEY_EVENTS_FLOWS.CHECKOUT]: {
    CHANGE_ADDRESS: 'Change Address',
    CHANGE_TIME_SLOT: 'Change Time Slot',
    SELECT_PAYMENT_METHOD: 'Select Payment Method',
  },
  [KEY_EVENTS_FLOWS.PAYMENT]: {
    SUBMIT_ORDER: 'Submit Order',
    VIEW_ORDER: 'View Order',
    PAY_ORDER: 'Pay Order',
  },
  [KEY_EVENTS_FLOWS.REFUND]: {
    CHANGE_ORDER: 'Change Order',
  },
};
