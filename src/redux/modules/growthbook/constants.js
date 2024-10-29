export const FEATURE_KEYS = {
  CLAIM_UNIQUE_PROMO: 'wb-6632_claim-unique-promo',
  SHOW_TIERED_MEMBERSHIP_BENEFIT: 'wb-7625_show_tier_benefit_in_join_membership_and_details_page',
  JOIN_MEMBERSHIP_NEW_DESIGN: 'wb-7756_join-membership-new-design',
};

export const DEFAULT_FEATURE_FLAG_RESULTS = {
  [FEATURE_KEYS.CLAIM_UNIQUE_PROMO]: {
    introURL: 'https://lp.storehub.com/claim-promo-url-centreplacecafe',
    congratsURL: 'https://lp.storehub.com/promotion-claimed',
  },
  [FEATURE_KEYS.SHOW_TIERED_MEMBERSHIP_BENEFIT]: [],
  [FEATURE_KEYS.JOIN_MEMBERSHIP_NEW_DESIGN]: false,
};
