/**
 * This is the new version of constants which export constants separately.
 * NOTE: If you copy something from the legacy constants file, please change same constants in that
 * file to a reference to this file, so that each constant is defined only once.
 */

export const DESKTOP_PAGE_WIDTH = 414;

export const COUNTRIES = {
  MY: 'MY',
  TH: 'TH',
  PH: 'PH',
  SG: 'SG',
  CN: 'CN',
};

export const COUNTRIES_DEFAULT_CURRENCIES = {
  [COUNTRIES.MY]: 'MYR',
  [COUNTRIES.TH]: 'THB',
  [COUNTRIES.PH]: 'PHP',
  [COUNTRIES.SG]: 'SGD',
  [COUNTRIES.CN]: 'CNY',
};

export const COUNTRIES_DEFAULT_LOCALE = {
  [COUNTRIES.MY]: 'MS-MY',
  [COUNTRIES.TH]: 'TH-TH',
  [COUNTRIES.PH]: 'EN-PH',
  [COUNTRIES.SG]: 'EN-SG',
  [COUNTRIES.CN]: 'ZH-CN',
};

export const WEB_VIEW_SOURCE = {
  IOS: 'iOS',
  Android: 'Android',
};

export const CLIENTS = {
  WEB: 'web',
  IOS: 'iOS',
  ANDROID: 'Android',
  MAC: 'Mac',
  PC: 'PC',
  TNG_MINI_PROGRAM: 'tngMiniProgram',
  GCASH_MINI_PROGRAM: 'gcashMiniProgram',
};

export const REGISTRATION_SOURCE = {
  BEEP_APP: 'BeepApp',
  RECEIPT: 'Receipt',
  BEEP_STORE: 'BeepStore',
  BEEP_SITE: 'BeepSite',
  TNGD_MINI_PROGRAM: 'BeepTngMiniProgram',
  GCASH_MINI_PROGRAM: 'BeepGCashMiniProgram',
  SHARED_LINK: 'SharedLink',
};

export const SOURCE_TYPE = {
  SHOPPING_CART: 'shoppingCart',
  SHARED_LINK: 'SharedLink',
  PUSH_NOTIFICATION: 'PushNotification',
  SMS: 'SMS',
};

export const URL_TYPES = {
  STATIC: 'static',
  DYNAMIC: 'dynamic',
};

export const API_REQUEST_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

export const PATH_NAME_MAPPING = {
  TERMS_OF_USE: '/terms-of-use',
  THANK_YOU: '/thank-you',
  PRIVACY: '/privacy-policy',
  ERROR: '/error',
  SORRY: '/sorry',
  REPORT_DRIVER: '/report-driver',
  STORES_HOME: '/',
  // ordering App basename
  ORDERING_BASE: '/ordering',
  ORDERING_HOME: '/',
  ORDERING_LOGIN: '/login',
  ORDERING_LOCATION_AND_DATE: '/location-date',
  ORDERING_LOCATION: '/location',
  ORDERING_CUSTOMER_INFO: '/customer',
  ORDERING_CART: '/cart',
  ORDERING_CART_SUBMISSION_STATUS: '/cart/cart-submission',
  ORDERING_TABLE_SUMMARY: '/table-summary',
  ORDERING_PROMOTION: '/promotion',
  ORDERING_PAYMENT: '/payment',
  ORDERING_STRIPE_PAYMENT: '/payment/stripe',
  ORDERING_STRIPE_PAYMENT_SAVE: '/payment/stripe/save',
  ORDERING_CREDIT_CARD_PAYMENT: '/payment/creditcard',
  ORDERING_ONLINE_BANKING_PAYMENT: '/payment/online-banking',
  ORDERING_ONLINE_SAVED_CARDS: '/payment/cards',
  MERCHANT_INFO: '/need-help',
  ORDERING_STORE_LIST: '/storeList',
  ADDRESS_LIST: '/addressList',
  ADDRESS_DETAIL: '/addressDetail',
  CONTACT_DETAIL: '/contactDetails',
  // cashback App basename
  CASHBACK_BASE: '/loyalty',
  CASHBACK_HOME: '/',
  CASHBACK_CLAIM: '/claim',
  CASHBACK_HISTORIES: '/activities',
  STORE_REDEMPTION: '/store-redemption',
  // site
  SITE_BASE: '/',
  SITE_HOME: '/home',
  QRSCAN: '/qrscan',
  SCAN: '/scan',
  SCAN_NOT_SUPPORT: '/scanNotSupport',
  ORDER_DETAILS: '/orderdetails',
  ORDER_HISTORY: '/order-history',
  // voucher
  VOUCHER_HOME: '/voucher',
  VOUCHER_CONTACT: '/voucher/contact',
  VOUCHER_THANK_YOU: '/voucher/thank-you',
  VOUCHER_SORRY: '/voucher/sorry',
  VOUCHER_PAYMENT: '/ordering/payment',
  // rewards App basename
  REWARDS_BASE: '/rewards',
  REWARDS_HOME: '/',
  REWARDS_BUSINESS: '/business',
  REWARDS_MEMBERSHIP: '/membership',
  SIGN_UP: '/sign-up',
  MEMBERSHIP_DETAIL: '/membership-detail',
  POINTS_HISTORY: '/points-history',
  CASHBACK_CREDITS_HISTORY: '/cashback-credits-history',
  SEAMLESS_LOYALTY: '/seamless-loyalty',
  UNIQUE_PROMO: '/promo',
  POINTS_REWARDS: '/points-rewards',
  LIST: '/list',
  CLAIM: '/claim',
  REWARDS_LOGIN: '/login',
  CASHBACK: '/cashback',
  CASHBACK_DETAIL: '/cashback-detail',
  // dine
  DINE: '/dine',
  FOOD_COURT: '/food-court',
  STORE_REVIEW: '/store-review',
};

export const SHIPPING_TYPES = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
  DINE_IN: 'dine-in',
  TAKE_AWAY: 'takeaway',
  DIGITAL: 'digital',
};

export const PROMOTION_CLIENT_TYPES = {
  TNG_MINI_PROGRAM: 'tngMiniProgram',
  GCASH_MINI_PROGRAM: 'gcashMiniProgram',
  APP: 'app',
  WEB: 'web',
};

export const WEEK_DAYS_I18N_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SH_LOGISTICS_VALID_TIME = {
  FROM: '09:00',
  TO: '21:00',
};

export const LOCATION_SELECTION_REASON_CODES = {
  OUT_OF_DELIVERY_RANGE: 'OutOfDeliveryRange',
  ADDRESS_NOT_FOUND: 'AddressNotFound',
};

export const ADDRESS_RANGE = {
  STREET: 2,
  CITY: 4,
  STATE: 5,
  COUNTRY: 6,
};

export const PAYMENT_METHOD_LABELS = {
  STRIPE: 'stripe',
  ONLINE_BANKING_PAY: 'OnlineBanking',
  CREDIT_CARD_PAY: 'CreditAndDebitCard',
  GRAB_PAY: 'GrabPay',
  BOOST_PAY: 'Boost',
  TNG_PAY: 'TouchNGo',
  GCASH_PAY: 'GCash',
  LINE_PAY: 'Line',
  GETZ_PAY: 'GetzPay',
  APPLE_PAY: 'ApplePay',
};

export const PAYMENT_PROVIDERS = {
  STRIPE: 'Stripe',
  APPLE_PAY: 'StripeApplePay',
  STRIPE_FPX: 'StripeFPX',
  TNG_ONLINE: 'TnGOnline',
  BOOST: 'Boost',
  GRAB_PAY: 'GrabPay',
  BEEP_TH_CREDIT_CARD: 'BeepTHCreditCard',
  BEEP_TH_ONLINE_BANKING: 'BeepTHOnlineBanking',
  BEEP_TH_LINE_PAY: 'BeepTHLinePay',
  BEEP_PH_CREDIT_CARD: 'BeepPHCreditCard',
  BEEP_PH_CCPP_GCASH: 'BeepPHCCPPGcash',
  SH_OFFLINE_PAYMENT: 'SHOfflinePayment', // Pay at counter
  TNG_MINI_PROGRAM: 'TNGMiniProgram',
  GCASH_MINI_PROGRAM: 'GCashMiniProgram',
};

export const PRODUCT_STOCK_STATUS = {
  NOT_TRACK_INVENTORY: 'notTrackInventory',
  IN_STOCK: 'inStock',
  LOW_STOCK: 'lowStock',
  OUT_OF_STOCK: 'outOfStock',
  UNAVAILABLE: 'unavailable',
};

export const ORDER_SOURCE = {
  TNG_MINI_PROGRAM: 'BeepTngMiniProgram',
  GCASH_MINI_PROGRAM: 'BeepGCashMiniProgram',
  BEEP_APP: 'BeepApp',
  BEEP_SITE: 'BeepSite',
  BEEP_STORE: 'BeepStore',
};

export const PRE_ORDER_IMMEDIATE_TAG = {
  from: 'now',
  to: 'now',
};

export const ORDER_STATUS = {
  CREATED: 'created',
  PENDING_PAYMENT: 'pendingPayment',
  PENDING_VERIFICATION: 'pendingVerification',
  PAID: 'paid',
  PAYMENT_CANCELLED: 'paymentCancelled',
  READY_FOR_DELIVERY: 'readyForDelivery',
  READY_FOR_PICKUP: 'readyForPickup',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  ACCEPTED: 'accepted',
  LOGISTICS_CONFIRMED: 'logisticsConfirmed',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  /**
   * If shipping type is delivery, pickedUp means picked up by rider.
   * if shipping type is self-pickup, pickedUp means picked up by customer
   * */
  PICKED_UP: 'pickedUp',
};

export const REGISTRATION_TOUCH_POINT = {
  CLAIM_CASHBACK: 'ClaimCashback',
  ONLINE_ORDER: 'OnlineOrder',
  QR_ORDER: 'QROrder',
  TNG: 'TNG',
  GCash: 'GCash',
};

// TODO: remove this after we have a better solution
export const TIME_SLOT_NOW = 'now';

export const TIME_SLOT = {
  NOW: 'now',
  TODAY: 'Today',
  TOMORROW: 'Tomorrow',
};

export const CASHBACK_SOURCE = {
  REGISTER: 'REGISTER',
  RECEIPT: 'RECEIPT',
  QR_ORDERING: 'QR_ORDERING',
};

export const CLAIM_CASHBACK_QUERY_NAMES = {
  STATUS: 'claimedStatus',
  VALUE: 'cashback',
};

export const REFERRER_SOURCE_TYPES = {
  PAYMENT: 'payment',
  CASHBACK: 'cashback',
  PAY_AT_COUNTER: 'payAtCounter',
  LOGIN: 'login',
  THANK_YOU: 'thankyou',
};

export const BECOME_MERCHANT_MEMBER_METHODS = {
  JOIN_MEMBERSHIP_URL_CLICK: 'JoinMembershipURL_ClickJoin',
  THANK_YOU_CASHBACK_CLICK: 'BeepQR_ThankYou',
  EARNED_CASHBACK_QR_SCAN: 'Receipt_CashbackQR',
  MEMBERSHIP_QR_SCAN: 'Receipt_MembershipQR',
  QR_ORDERING_ORDER_COMPLETED: 'BeepQR_Transaction',
  DELIVERY_ORDERING_ORDER_COMPLETED: 'BeepDel_Transaction',
  OFFLINE_STORE_ORDER_COMPLETE: 'POS_Transaction',
  SEAMLESS_LOYALTY_QR_SCAN: 'POS_SeamlessLoyaltyQR',
};

export const PROMO_VOUCHER_DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  ABSOLUTE: 'absolute',
};

export const PROMO_VOUCHER_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REDEEMED: 'redeemed',
};

export const MEMBER_LEVELS = {
  MEMBER: 1,
  SLIVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

export const MEMBER_CARD_COLOR_PALETTES = {
  [MEMBER_LEVELS.MEMBER]: {
    icon: {
      crown: {
        startColor: '#91F7E7',
        endColor: '#52A1FF',
      },
      background: {
        startColor: '#DCFCFF',
        endColor: '#D2DEFF',
      },
      outlineColor: '#303030',
    },
    background: {
      startColor: '#91F7E7',
      midColor: '#99C8FF',
      endColor: '#52A1FF',
    },
    progress: '#303030',
    font: '#303030',
  },
  [MEMBER_LEVELS.SLIVER]: {
    icon: {
      crown: {
        startColor: '#AFAFAF',
        endColor: '#AFAFAF',
      },
      background: {
        startColor: '#F3F3F3',
        endColor: '#CCCCCC',
      },
      outlineColor: '#303030',
    },
    background: {
      startColor: '#AFAFAF',
      midColor: '#E0E0E0',
      endColor: '#CCC',
    },
    progress: '#303030',
    font: '#303030',
  },
  [MEMBER_LEVELS.GOLD]: {
    icon: {
      crown: {
        startColor: '#FFF143',
        endColor: '#FFBD17',
      },
      background: {
        startColor: '#FFFBE6',
        endColor: '#FFFEAD',
      },
      outlineColor: '#303030',
    },
    background: {
      startColor: '#FFF143',
      midColor: '#FFBD17',
      endColor: '#FFCF43',
    },
    progress: '#303030',
    font: '#303030',
  },
  [MEMBER_LEVELS.PLATINUM]: {
    icon: {
      crown: {
        startColor: '#000000',
        endColor: '#000000',
      },
      background: {
        startColor: '#EAEAEA',
        endColor: '#AFAFAF',
      },
      outlineColor: '#717171',
    },
    background: {
      startColor: '#000000',
      midColor: '#4E4E4E',
      endColor: '#000000',
    },
    progress: '#717171',
    font: '#FFFFFF',
  },
};

export const MEMBER_CARD_LEVELS_PALETTES = {
  [MEMBER_LEVELS.MEMBER]: {
    icon: {
      crown: {
        startColor: '#91F7E7',
        endColor: '#52A1FF',
      },
      background: {
        startColor: '#DCFCFF',
        endColor: '#D2DEFF',
      },
      strokeColor: '#5CADFC',
    },
    background: {
      startColor: '#CFFFF7',
      midColor: '#C8E1FF',
      endColor: '#97C4FA',
    },
    progress: '#231651',
    font: '#1C1C1C',
  },
  [MEMBER_LEVELS.SLIVER]: {
    icon: {
      crown: {
        startColor: '#869696',
        endColor: '#CDCDCD',
      },
      background: {
        startColor: '#FFFFFF',
        endColor: '#D9D9D9',
      },
      strokeColor: '#9E9E9E',
    },
    background: {
      startColor: '#D2D2D2',
      midColor: '#F2F2F2',
      endColor: '#CCCCCC',
    },
    progress: '#231651',
    font: '#303030',
  },
  [MEMBER_LEVELS.GOLD]: {
    icon: {
      crown: {
        startColor: '#E6AF20',
        endColor: '#BF8B09',
      },
      background: {
        startColor: '#FDFBC1',
        endColor: '#E3B151',
      },
      strokeColor: '#C4900C',
    },
    background: {
      startColor: '#FFFDCA',
      midColor: '#FED48E',
      endColor: '#FFEED0',
    },
    progress: '#231651',
    font: '#303030',
  },
  [MEMBER_LEVELS.PLATINUM]: {
    icon: {
      crown: {
        startColor: '#FFFFFF',
        endColor: '#999999',
      },
      background: {
        startColor: '#757575',
        endColor: '#000000',
      },
      strokeColor: '#141414',
    },
    background: {
      startColor: '#000000',
      midColor: '#6A6A6A',
      endColor: '#202020',
    },
    progress: '#231651',
    font: '#FFFFFF',
  },
};
