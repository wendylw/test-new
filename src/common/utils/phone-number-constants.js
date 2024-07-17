export const COUNTRIES = {
  MY: 'MY',
  TH: 'TH',
  PH: 'PH',
  SG: 'SG',
  CN: 'CN',
};

export const PHONE_NUMBER_COUNTRIES = {
  [COUNTRIES.MY]: '60',
  [COUNTRIES.TH]: '66',
  [COUNTRIES.PH]: '63',
  [COUNTRIES.SG]: '65',
  [COUNTRIES.CN]: '86',
};

export const AVAILABLE_COUNTRIES = Object.values(COUNTRIES);

export const SYSTEM_DEFAULT_COUNTRY = COUNTRIES.MY;
