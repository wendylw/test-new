import { PROMO_VOUCHER_STATUS } from '../constants';

export const REWARDS_APPLIED_ALL_STORES = 'All';

export const DEFAULT_NEAR_EXPIRY_DAYS = 8;

export const REWARDS_APPLIED_SOURCES = {
  POS: 1,
  E_Commerce: 2,
  Beep_Pickup: 5,
  Beep_Delivery: 6,
  Beep_Takeaway: 7,
  Beep_DineIn: 8,
};

export const REWARD_APPLY_TO_LIMITS_CONDITIONS = {
  ENTITY: {
    TRANSACTION: 'TRANSACTION',
    PRODUCT: 'PRODUCT',
    CUSTOMER: 'CUSTOMER',
    BUSINESS: 'BUSINESS',
  },
  PROPERTY_NAME: {
    TOTAL: 'total',
    TAGS: 'tags',
    ID: 'id',
    CATEGORY: 'category',
  },
  OPERATOR: {
    GTE: 'gte',
  },
};

/**
 * i18n keys
 */
export const UNIQUE_PROMO_STATUS_I18KEYS = {
  [PROMO_VOUCHER_STATUS.EXPIRED]: 'Expired',
  [PROMO_VOUCHER_STATUS.REDEEMED]: 'Redeemed',
};

export const REWARD_STATUS_I18N_KEYS = {
  [PROMO_VOUCHER_STATUS.EXPIRED]: 'Expired',
  [PROMO_VOUCHER_STATUS.REDEEMED]: 'Redeemed',
};

export const REWARDS_APPLIED_SOURCE_I18KEYS = {
  [REWARDS_APPLIED_SOURCES.POS]: 'POS',
  [REWARDS_APPLIED_SOURCES.E_Commerce]: 'Ecommerce',
  [REWARDS_APPLIED_SOURCES.Beep_Pickup]: 'BeepPickup',
  [REWARDS_APPLIED_SOURCES.Beep_Delivery]: 'BeepDelivery',
  [REWARDS_APPLIED_SOURCES.Beep_Takeaway]: 'BeepTakeaway',
  [REWARDS_APPLIED_SOURCES.Beep_DineIn]: 'BeepDineIn',
};
/* end of i18n */
