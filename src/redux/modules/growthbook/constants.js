export const FEATURE_KEYS = {
  QR_TAKEAWAY: 'wb-4378_beep-qr-takeaway',
  FOUNDATION_OF_TIERED_MEMBERSHIP: 'wb-6329_foundation-of-tiered-membership',
  CLAIM_UNIQUE_PROMO: '',
};

export const DEFAULT_FEATURE_FLAG_RESULTS = {
  [FEATURE_KEYS.QR_TAKEAWAY]: false,
  [FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP]: {
    introURL: 'https://lp.storehub.com/beep-test-join-membership',
    congratsURL: 'https://lp.storehub.com/beep-membership-welcome',
  },
  [FEATURE_KEYS.CLAIM_UNIQUE_PROMO]: {
    introURL: 'https://lp.storehub.com/',
    congratsURL: 'https://lp.storehub.com/',
  },
};
