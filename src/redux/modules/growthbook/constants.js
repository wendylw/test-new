export const FEATURE_KEYS = {
  CLAIM_UNIQUE_PROMO: 'wb-6632_claim-unique-promo',
  REDESIGN_APPLY_VOUCHER_PROMO: 'wb-9319_redesign_apply_voucher_promotion_page',
};

export const DEFAULT_FEATURE_FLAG_RESULTS = {
  [FEATURE_KEYS.CLAIM_UNIQUE_PROMO]: {
    introURL: 'https://lp.storehub.com/claim-promo-url-centreplacecafe',
    congratsURL: 'https://lp.storehub.com/promotion-claimed',
  },
  [FEATURE_KEYS.REDESIGN_APPLY_VOUCHER_PROMO]: false,
};
