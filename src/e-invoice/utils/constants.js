export const SEARCH_RADIO_LIST_INPUT_DEFAULT_FOCUS_DELAY = 400;

export const E_INVOICE_APP_CONTAINER_ID = 'e-invoice-app-container';

export const PATHS = {
  BASE: '/',
  E_INVOICE: '/e-invoice',
  CATEGORY: '/category',
  CONSUMER: '/consumer',
  BUSINESS: '/business',
  PROFILE: '/profile',
  FORM: '/edit',
  PREVIEW: '/preview',
  INVALID: '/invalid',
};

export const PAGE_ROUTES = {
  E_INVOICE: PATHS.BASE,
  CATEGORY: PATHS.CATEGORY,
  INVALID: PATHS.INVALID,
  CONSUMER_FORM: `${PATHS.CONSUMER}${PATHS.PROFILE}${PATHS.FORM}`,
  CONSUMER_PREVIEW: `${PATHS.CONSUMER}${PATHS.PROFILE}${PATHS.PREVIEW}`,
  BUSINESS_FORM: `${PATHS.BUSINESS}${PATHS.PROFILE}${PATHS.FORM}`,
  BUSINESS_PREVIEW: `${PATHS.BUSINESS}${PATHS.PROFILE}${PATHS.PREVIEW}`,
};

export const E_INVOICE_TYPES = {
  MALAYSIAN: 'Malaysian',
  NON_MALAYSIAN: 'Non-Malaysian',
  BUSINESS: 'Business',
};

export const E_INVOICE_STATUS = {
  REJECT: 'REJECT',
  SUBMITTED: 'SUBMITTED',
  VALID: 'VALID',
  CANCEL: 'CANCEL',
};

export const AVAILABLE_QUERY_E_INVOICE_STATUS_PAGES = {
  HOME: 'home',
  CONSUMER_PREVIEW: 'consumerPreview',
  BUSINESS_PREVIEW: 'businessPreview',
};

export const GET_E_INVOICE_STATUS_ERROR_CODES = {
  NO_E_INVOICE_SUBMIT_RECORD: '395522',
};

export const E_INVOICE_STATUS_TIMEOUT = 10 * 1000;

export const SUBMITTED_TIMEOUT_ERROR_MESSAGE = 'SUBMITTED_TIMEOUT';

export const COUNTRIES = {
  ABW: {
    countryCode: 'ABW',
    name: 'Aruba',
  },
  AFG: {
    countryCode: 'AFG',
    name: 'Afghanistan',
  },
  AGO: {
    countryCode: 'AGO',
    name: 'Angola',
  },
  AIA: {
    countryCode: 'AIA',
    name: 'Anguilla',
  },
  ALA: {
    countryCode: 'ALA',
    name: 'Aland Islands',
  },
  ALB: {
    countryCode: 'ALB',
    name: 'Albania',
  },
  AND: {
    countryCode: 'AND',
    name: 'Andora',
  },
  ARE: {
    countryCode: 'ARE',
    name: 'United Arab Emirates',
  },
  ARG: {
    countryCode: 'ARG',
    name: 'Argentina',
  },
  ARM: {
    countryCode: 'ARM',
    name: 'Armenia',
  },
  ASM: {
    countryCode: 'ASM',
    name: 'American Samoa',
  },
  ATA: {
    countryCode: 'ATA',
    name: 'Antarctica',
  },
  ATF: {
    countryCode: 'ATF',
    name: 'French Southern Territories',
  },
  ATG: {
    countryCode: 'ATG',
    name: 'Antigua and Barbuda',
  },
  AUS: {
    countryCode: 'AUS',
    name: 'Australia',
  },
  AUT: {
    countryCode: 'AUT',
    name: 'Austria',
  },
  AZE: {
    countryCode: 'AZE',
    name: 'Azerbaidjan',
  },
  BDI: {
    countryCode: 'BDI',
    name: 'Burundi',
  },
  BEL: {
    countryCode: 'BEL',
    name: 'Belgium',
  },
  BEN: {
    countryCode: 'BEN',
    name: 'Benin',
  },
  BES: {
    countryCode: 'BES',
    name: 'Bonaire, Sint Eustatius and Saba',
  },
  BFA: {
    countryCode: 'BFA',
    name: 'Burkina Faso',
  },
  BGD: {
    countryCode: 'BGD',
    name: 'Bangladesh',
  },
  BGR: {
    countryCode: 'BGR',
    name: 'Bulgaria',
  },
  BHR: {
    countryCode: 'BHR',
    name: 'Bahrain',
  },
  BHS: {
    countryCode: 'BHS',
    name: 'Bahamas',
  },
  BIH: {
    countryCode: 'BIH',
    name: 'Bosnia and Herzegovina',
  },
  BLM: {
    countryCode: 'BLM',
    name: 'Saint Barthelemy',
  },
  BLR: {
    countryCode: 'BLR',
    name: 'Belarus',
  },
  BLZ: {
    countryCode: 'BLZ',
    name: 'Belize',
  },
  BMU: {
    countryCode: 'BMU',
    name: 'Bermuda',
  },
  BOL: {
    countryCode: 'BOL',
    name: 'Bolivia',
  },
  BRA: {
    countryCode: 'BRA',
    name: 'Brazil',
  },
  BRB: {
    countryCode: 'BRB',
    name: 'Barbados',
  },
  BRN: {
    countryCode: 'BRN',
    name: 'Brunei Darussalam',
  },
  BTN: {
    countryCode: 'BTN',
    name: 'Bhutan',
  },
  BVT: {
    countryCode: 'BVT',
    name: 'Bouvet Island',
  },
  BWA: {
    countryCode: 'BWA',
    name: 'Botswana',
  },
  CAF: {
    countryCode: 'CAF',
    name: 'Central African Republic',
  },
  CAN: {
    countryCode: 'CAN',
    name: 'Canada',
  },
  CCK: {
    countryCode: 'CCK',
    name: 'Cocos Island',
  },
  CHE: {
    countryCode: 'CHE',
    name: 'Switzerland',
  },
  CHL: {
    countryCode: 'CHL',
    name: 'Chile',
  },
  CHN: {
    countryCode: 'CHN',
    name: 'China',
  },
  CIV: {
    countryCode: 'CIV',
    name: "Cote D'ivoire",
  },
  CMR: {
    countryCode: 'CMR',
    name: 'Cameroon',
  },
  COD: {
    countryCode: 'COD',
    name: 'Congo, the Democratic Republic',
  },
  COG: {
    countryCode: 'COG',
    name: 'Congo',
  },
  COK: {
    countryCode: 'COK',
    name: 'Cook Islands ',
  },
  COL: {
    countryCode: 'COL',
    name: 'Colombia',
  },
  COM: {
    countryCode: 'COM',
    name: 'Comoros',
  },
  CPV: {
    countryCode: 'CPV',
    name: 'Cape Verde',
  },
  CRI: {
    countryCode: 'CRI',
    name: 'Costa Rica',
  },
  CUB: {
    countryCode: 'CUB',
    name: 'Cuba',
  },
  CUW: {
    countryCode: 'CUW',
    name: 'Curacao',
  },
  CXR: {
    countryCode: 'CXR',
    name: 'Christmas Islands',
  },
  CYM: {
    countryCode: 'CYM',
    name: 'Cayman Islands',
  },
  CYP: {
    countryCode: 'CYP',
    name: 'Cyprus',
  },
  CZE: {
    countryCode: 'CZE',
    name: 'Czech Republic',
  },
  DEU: {
    countryCode: 'DEU',
    name: 'Germany',
  },
  DJI: {
    countryCode: 'DJI',
    name: 'Djibouti',
  },
  DMA: {
    countryCode: 'DMA',
    name: 'Dominica',
  },
  DNK: {
    countryCode: 'DNK',
    name: 'Denmark',
  },
  DOM: {
    countryCode: 'DOM',
    name: 'Dominican Republic',
  },
  DZA: {
    countryCode: 'DZA',
    name: 'Algeria',
  },
  ECU: {
    countryCode: 'ECU',
    name: 'Ecuador',
  },
  EGY: {
    countryCode: 'EGY',
    name: 'Egypt',
  },
  ERI: {
    countryCode: 'ERI',
    name: 'Eritrea',
  },
  ESH: {
    countryCode: 'ESH',
    name: 'Western Sahara',
  },
  ESP: {
    countryCode: 'ESP',
    name: 'Spain',
  },
  EST: {
    countryCode: 'EST',
    name: 'Estonia',
  },
  ETH: {
    countryCode: 'ETH',
    name: 'Ethiopia',
  },
  FIN: {
    countryCode: 'FIN',
    name: 'Finland',
  },
  FJI: {
    countryCode: 'FJI',
    name: 'Fiji',
  },
  FLK: {
    countryCode: 'FLK',
    name: 'Falkland Islands (Malvinas)',
  },
  FRA: {
    countryCode: 'FRA',
    name: 'France',
  },
  FRO: {
    countryCode: 'FRO',
    name: 'Faeroe Islands',
  },
  FSM: {
    countryCode: 'FSM',
    name: 'Micronesia, Federated States Of',
  },
  GAB: {
    countryCode: 'GAB',
    name: 'Gabon',
  },
  GBR: {
    countryCode: 'GBR',
    name: 'United Kingdom',
  },
  GEO: {
    countryCode: 'GEO',
    name: 'Georgia',
  },
  GGY: {
    countryCode: 'GGY',
    name: 'Guernsey',
  },
  GHA: {
    countryCode: 'GHA',
    name: 'Ghana',
  },
  GIB: {
    countryCode: 'GIB',
    name: 'Gibraltar',
  },
  GIN: {
    countryCode: 'GIN',
    name: 'Guinea',
  },
  GLP: {
    countryCode: 'GLP',
    name: 'Guadeloupe',
  },
  GMB: {
    countryCode: 'GMB',
    name: 'Gambia',
  },
  GNB: {
    countryCode: 'GNB',
    name: 'Guinea-Bissau',
  },
  GNQ: {
    countryCode: 'GNQ',
    name: 'Equatorial Guinea',
  },
  GRC: {
    countryCode: 'GRC',
    name: 'Greece',
  },
  GRD: {
    countryCode: 'GRD',
    name: 'Grenada',
  },
  GRL: {
    countryCode: 'GRL',
    name: 'Greenland',
  },
  GTM: {
    countryCode: 'GTM',
    name: 'Guatemala',
  },
  GUF: {
    countryCode: 'GUF',
    name: 'French Guiana',
  },
  GUM: {
    countryCode: 'GUM',
    name: 'Guam',
  },
  GUY: {
    countryCode: 'GUY',
    name: 'Guyana',
  },
  HKG: {
    countryCode: 'HKG',
    name: 'Hong Kong',
  },
  HMD: {
    countryCode: 'HMD',
    name: 'Heard and Mcdonald Islands',
  },
  HND: {
    countryCode: 'HND',
    name: 'Honduras',
  },
  HRV: {
    countryCode: 'HRV',
    name: 'Croatia',
  },
  HTI: {
    countryCode: 'HTI',
    name: 'Haiti',
  },
  HUN: {
    countryCode: 'HUN',
    name: 'Hungary',
  },
  IDN: {
    countryCode: 'IDN',
    name: 'Indonesia',
  },
  IMN: {
    countryCode: 'IMN',
    name: 'Isle of Man',
  },
  IND: {
    countryCode: 'IND',
    name: 'India',
  },
  IOT: {
    countryCode: 'IOT',
    name: 'British Indian Ocean Territory',
  },
  IRL: {
    countryCode: 'IRL',
    name: 'Ireland',
  },
  IRN: {
    countryCode: 'IRN',
    name: 'Iran',
  },
  IRQ: {
    countryCode: 'IRQ',
    name: 'Iraq',
  },
  ISL: {
    countryCode: 'ISL',
    name: 'Iceland',
  },
  ISR: {
    countryCode: 'ISR',
    name: 'Israel',
  },
  ITA: {
    countryCode: 'ITA',
    name: 'Italy',
  },
  JAM: {
    countryCode: 'JAM',
    name: 'Jamaica',
  },
  JEY: {
    countryCode: 'JEY',
    name: 'Jersey (Channel Islands)',
  },
  JOR: {
    countryCode: 'JOR',
    name: 'Jordan ',
  },
  JPN: {
    countryCode: 'JPN',
    name: 'Japan',
  },
  KAZ: {
    countryCode: 'KAZ',
    name: 'Kazakhstan',
  },
  KEN: {
    countryCode: 'KEN',
    name: 'Kenya',
  },
  KGZ: {
    countryCode: 'KGZ',
    name: 'Kyrgyzstan',
  },
  KHM: {
    countryCode: 'KHM',
    name: 'Cambodia',
  },
  KIR: {
    countryCode: 'KIR',
    name: 'Kiribati',
  },
  KNA: {
    countryCode: 'KNA',
    name: 'St.Kitts and Nevis',
  },
  KOR: {
    countryCode: 'KOR',
    name: 'The Republic of Korea',
  },
  KWT: {
    countryCode: 'KWT',
    name: 'Kuwait',
  },
  LAO: {
    countryCode: 'LAO',
    name: 'Laos',
  },
  LBN: {
    countryCode: 'LBN',
    name: 'Lebanon',
  },
  LBR: {
    countryCode: 'LBR',
    name: 'Liberia',
  },
  LBY: {
    countryCode: 'LBY',
    name: 'Libyan Arab Jamahiriya',
  },
  LCA: {
    countryCode: 'LCA',
    name: 'Saint Lucia ',
  },
  LIE: {
    countryCode: 'LIE',
    name: 'Liechtenstein ',
  },
  LKA: {
    countryCode: 'LKA',
    name: 'Sri Lanka  ',
  },
  LSO: {
    countryCode: 'LSO',
    name: 'Lesotho',
  },
  LTU: {
    countryCode: 'LTU',
    name: 'Lithuania',
  },
  LUX: {
    countryCode: 'LUX',
    name: 'Luxembourg',
  },
  LVA: {
    countryCode: 'LVA',
    name: 'Latvia ',
  },
  MAC: {
    countryCode: 'MAC',
    name: 'Macao',
  },
  MAF: {
    countryCode: 'MAF',
    name: 'Saint Martin (French Part)',
  },
  MAR: {
    countryCode: 'MAR',
    name: 'Morocco',
  },
  MCO: {
    countryCode: 'MCO',
    name: 'Monaco',
  },
  MDA: {
    countryCode: 'MDA',
    name: 'Moldova, Republic of',
  },
  MDG: {
    countryCode: 'MDG',
    name: 'Madagascar',
  },
  MDV: {
    countryCode: 'MDV',
    name: 'Maldives',
  },
  MEX: {
    countryCode: 'MEX',
    name: 'Mexico',
  },
  MHL: {
    countryCode: 'MHL',
    name: 'Marshall Islands ',
  },
  MKD: {
    countryCode: 'MKD',
    name: 'Macedonia, the Former Yugoslav Republic of',
  },
  MLI: {
    countryCode: 'MLI',
    name: 'Mali',
  },
  MLT: {
    countryCode: 'MLT',
    name: 'Malta',
  },
  MMR: {
    countryCode: 'MMR',
    name: 'Myanmar',
  },
  MNE: {
    countryCode: 'MNE',
    name: 'Montenegro',
  },
  MNG: {
    countryCode: 'MNG',
    name: 'Mongolia ',
  },
  MNP: {
    countryCode: 'MNP',
    name: 'Northern Mariana Islands',
  },
  MOZ: {
    countryCode: 'MOZ',
    name: 'Mozambique',
  },
  MRT: {
    countryCode: 'MRT',
    name: 'Mauritania',
  },
  MSR: {
    countryCode: 'MSR',
    name: 'Montserrat',
  },
  MTQ: {
    countryCode: 'MTQ',
    name: 'Martinique',
  },
  MUS: {
    countryCode: 'MUS',
    name: 'Mauritius',
  },
  MWI: {
    countryCode: 'MWI',
    name: 'Malawi',
  },
  MYS: {
    countryCode: 'MYS',
    name: 'Malaysia',
  },
  MYT: {
    countryCode: 'MYT',
    name: 'Mayotte',
  },
  NAM: {
    countryCode: 'NAM',
    name: 'Namibia',
  },
  NCL: {
    countryCode: 'NCL',
    name: 'New caledonia ',
  },
  NER: {
    countryCode: 'NER',
    name: 'Niger',
  },
  NFK: {
    countryCode: 'NFK',
    name: 'Norfolk Island',
  },
  NGA: {
    countryCode: 'NGA',
    name: 'Nigeria',
  },
  NIC: {
    countryCode: 'NIC',
    name: 'Nicaragua',
  },
  NIU: {
    countryCode: 'NIU',
    name: 'Niue',
  },
  NLD: {
    countryCode: 'NLD',
    name: 'Netherlands',
  },
  NOR: {
    countryCode: 'NOR',
    name: 'Norway',
  },
  NPL: {
    countryCode: 'NPL',
    name: 'Nepal',
  },
  NRU: {
    countryCode: 'NRU',
    name: 'Nauru',
  },
  NZL: {
    countryCode: 'NZL',
    name: 'New Zealand ',
  },
  OMN: {
    countryCode: 'OMN',
    name: 'Oman',
  },
  PAK: {
    countryCode: 'PAK',
    name: 'Pakistan',
  },
  PAN: {
    countryCode: 'PAN',
    name: 'Panama',
  },
  PCN: {
    countryCode: 'PCN',
    name: 'Pitcairn',
  },
  PER: {
    countryCode: 'PER',
    name: 'Peru',
  },
  PHL: {
    countryCode: 'PHL',
    name: 'Philippines',
  },
  PLW: {
    countryCode: 'PLW',
    name: 'Palau',
  },
  PNG: {
    countryCode: 'PNG',
    name: 'Papua New Guinea',
  },
  POL: {
    countryCode: 'POL',
    name: 'Poland',
  },
  PRI: {
    countryCode: 'PRI',
    name: 'Puerto Rico',
  },
  PRK: {
    countryCode: 'PRK',
    name: 'Democ.peoples Rep.of Korea',
  },
  PRT: {
    countryCode: 'PRT',
    name: 'Portugal',
  },
  PRY: {
    countryCode: 'PRY',
    name: 'Paraguay',
  },
  PSE: {
    countryCode: 'PSE',
    name: 'Palestinian Territory, Occupied',
  },
  PYF: {
    countryCode: 'PYF',
    name: 'French Polynesia',
  },
  QAT: {
    countryCode: 'QAT',
    name: 'Qatar',
  },
  REU: {
    countryCode: 'REU',
    name: 'Reunion',
  },
  ROU: {
    countryCode: 'ROU',
    name: 'Romania',
  },
  RUS: {
    countryCode: 'RUS',
    name: 'Russian Federation (Ussr)',
  },
  RWA: {
    countryCode: 'RWA',
    name: 'Rwanda',
  },
  SAU: {
    countryCode: 'SAU',
    name: 'Saudi Arabia',
  },
  SDN: {
    countryCode: 'SDN',
    name: 'Sudan',
  },
  SEN: {
    countryCode: 'SEN',
    name: 'Senegal',
  },
  SGP: {
    countryCode: 'SGP',
    name: 'Singapore',
  },
  SGS: {
    countryCode: 'SGS',
    name: 'South Georgia and The South Sandwich Island',
  },
  SHN: {
    countryCode: 'SHN',
    name: 'St. Helena ',
  },
  SJM: {
    countryCode: 'SJM',
    name: 'Svalbard and Jan Mayen Islands',
  },
  SLB: {
    countryCode: 'SLB',
    name: 'Solomon Islands',
  },
  SLE: {
    countryCode: 'SLE',
    name: 'Sierra Leone',
  },
  SLV: {
    countryCode: 'SLV',
    name: 'El Salvador',
  },
  SMR: {
    countryCode: 'SMR',
    name: 'San Marino',
  },
  SOM: {
    countryCode: 'SOM',
    name: 'Somalia',
  },
  SPM: {
    countryCode: 'SPM',
    name: 'St. Pierre and Miquelon',
  },
  SRB: {
    countryCode: 'SRB',
    name: 'Serbia & montenegro ',
  },
  SSD: {
    countryCode: 'SSD',
    name: 'South Sudan',
  },
  STP: {
    countryCode: 'STP',
    name: 'Sao Tome and Principe',
  },
  SUR: {
    countryCode: 'SUR',
    name: 'Suriname',
  },
  SVK: {
    countryCode: 'SVK',
    name: 'Slovak Republic',
  },
  SVN: {
    countryCode: 'SVN',
    name: 'Slovenia',
  },
  SWE: {
    countryCode: 'SWE',
    name: 'Sweden',
  },
  SWZ: {
    countryCode: 'SWZ',
    name: 'Eswatini, Kingdom of (Swaziland)',
  },
  SXM: {
    countryCode: 'SXM',
    name: 'Sint Maarten (Dutch Part)',
  },
  SYC: {
    countryCode: 'SYC',
    name: 'Seychelles',
  },
  SYR: {
    countryCode: 'SYR',
    name: 'Syrian Arab Republic',
  },
  TCA: {
    countryCode: 'TCA',
    name: 'Turks and Caicos Islands',
  },
  TCD: {
    countryCode: 'TCD',
    name: 'Chad',
  },
  TGO: {
    countryCode: 'TGO',
    name: 'Togo',
  },
  THA: {
    countryCode: 'THA',
    name: 'Thailand',
  },
  TJK: {
    countryCode: 'TJK',
    name: 'Tajikistan',
  },
  TKL: {
    countryCode: 'TKL',
    name: 'Tokelau',
  },
  TKM: {
    countryCode: 'TKM',
    name: 'Turkmenistan',
  },
  TLS: {
    countryCode: 'TLS',
    name: 'Timor-Leste ',
  },
  TON: {
    countryCode: 'TON',
    name: 'Tonga',
  },
  TTO: {
    countryCode: 'TTO',
    name: 'Trinidad and Tobago',
  },
  TUN: {
    countryCode: 'TUN',
    name: 'Tunisia',
  },
  TUR: {
    countryCode: 'TUR',
    name: 'Turkiye ',
  },
  TUV: {
    countryCode: 'TUV',
    name: 'Tuvalu',
  },
  TWN: {
    countryCode: 'TWN',
    name: 'Taiwan',
  },
  TZA: {
    countryCode: 'TZA',
    name: 'Tanzania United Republic',
  },
  UGA: {
    countryCode: 'UGA',
    name: 'Uganda',
  },
  UKR: {
    countryCode: 'UKR',
    name: 'Ukraine',
  },
  UMI: {
    countryCode: 'UMI',
    name: 'United States Minor Outlying Islands',
  },
  URY: {
    countryCode: 'URY',
    name: 'Uruguay',
  },
  USA: {
    countryCode: 'USA',
    name: 'United States of America',
  },
  UZB: {
    countryCode: 'UZB',
    name: 'Uzbekistan',
  },
  VAT: {
    countryCode: 'VAT',
    name: 'Vatican City State (Holy See)',
  },
  VCT: {
    countryCode: 'VCT',
    name: 'Saint Vincent and Grenadines',
  },
  VEN: {
    countryCode: 'VEN',
    name: 'Venezuela',
  },
  VGB: {
    countryCode: 'VGB',
    name: 'Virgin Islands(British)',
  },
  VIR: {
    countryCode: 'VIR',
    name: 'Virgin Islands(US)',
  },
  VNM: {
    countryCode: 'VNM',
    name: 'Vietnam',
  },
  VUT: {
    countryCode: 'VUT',
    name: 'Vanuatu',
  },
  WLF: {
    countryCode: 'WLF',
    name: 'Wallis and Futuna Islands',
  },
  WSM: {
    countryCode: 'WSM',
    name: 'Samoa',
  },
  YEM: {
    countryCode: 'YEM',
    name: 'Yemen',
  },
  ZAF: {
    countryCode: 'ZAF',
    name: 'South Africa',
  },
  ZMB: {
    countryCode: 'ZMB',
    name: 'Zambia',
  },
  ZWE: {
    countryCode: 'ZWE',
    name: 'Zimbabwe',
  },
};

export const MALAYSIA_STATES = {
  '00': {
    state: '00',
    name: 'All States',
  },
  '01': {
    state: '01',
    name: 'Johor',
  },
  '02': {
    state: '02',
    name: 'Kedah',
  },
  '03': {
    state: '03',
    name: 'Kelantan',
  },
  '04': {
    state: '04',
    name: 'Melaka',
  },
  '05': {
    state: '05',
    name: 'Negeri Sembilan',
  },
  '06': {
    state: '06',
    name: 'Pahang',
  },
  '07': {
    state: '07',
    name: 'Pulau Pinang',
  },
  '08': {
    state: '08',
    name: 'Perak',
  },
  '09': {
    state: '09',
    name: 'Perlis',
  },
  '10': {
    state: '10',
    name: 'Selangor',
  },
  '11': {
    state: '11',
    name: 'Terengganu',
  },
  '12': {
    state: '12',
    name: 'Sabah',
  },
  '13': {
    state: '13',
    name: 'Sarawak',
  },
  '14': {
    state: '14',
    name: 'Wilayah Persekutuan Kuala Lumpur',
  },
  '15': {
    state: '15',
    name: 'Wilayah Persekutuan Labuan',
  },
  '16': {
    state: '16',
    name: 'Wilayah Persekutuan Putrajaya',
  },
  '17': {
    state: '17',
    name: 'Not Applicable',
  },
};

export const CLASSIFICATIONS = {
  '001': {
    classification: '001',
    name: 'Breastfeeding equipment ',
  },
  '002': {
    classification: '002',
    name: 'Child care centres and kindergartens fees',
  },
  '003': {
    classification: '003',
    name: 'Computer, smartphone or tablet',
  },
  '004': {
    classification: '004',
    name: 'Consolidated e-Invoice ',
  },
  '005': {
    classification: '005',
    name:
      'Construction materials (as specified under Fourth Schedule of the Lembaga Pembangunan Industri Pembinaan Malaysia Act 1994)',
  },
  '006': {
    classification: '006',
    name: 'Disbursement ',
  },
  '007': {
    classification: '007',
    name: 'Donation',
  },
  '008': {
    classification: '008',
    name: 'e-Commerce - e-Invoice to buyer / purchaser',
  },
  '009': {
    classification: '009',
    name: 'e-Commerce - Self-billed e-Invoice to seller, logistics, etc. ',
  },
  '010': {
    classification: '010',
    name: 'Education fees',
  },
  '011': {
    classification: '011',
    name: 'Goods on consignment (Consignor)',
  },
  '012': {
    classification: '012',
    name: 'Goods on consignment (Consignee)',
  },
  '013': {
    classification: '013',
    name: 'Gym membership',
  },
  '014': {
    classification: '014',
    name: 'Insurance - Education and medical benefits',
  },
  '015': {
    classification: '015',
    name: 'Insurance - Takaful or life insurance',
  },
  '016': {
    classification: '016',
    name: 'Interest and financing expenses',
  },
  '017': {
    classification: '017',
    name: 'Internet subscription ',
  },
  '018': {
    classification: '018',
    name: 'Land and building',
  },
  '019': {
    classification: '019',
    name:
      'Medical examination for learning disabilities and early intervention or rehabilitation treatments of learning disabilities',
  },
  '020': {
    classification: '020',
    name: 'Medical examination or vaccination expenses',
  },
  '021': {
    classification: '021',
    name: 'Medical expenses for serious diseases',
  },
  '022': {
    classification: '022',
    name: 'Others',
  },
  '023': {
    classification: '023',
    name: 'Petroleum operations (as defined in Petroleum (Income Tax) Act 1967)',
  },
  '024': {
    classification: '024',
    name: 'Private retirement scheme or deferred annuity scheme ',
  },
  '025': {
    classification: '025',
    name: 'Motor vehicle',
  },
  '026': {
    classification: '026',
    name: 'Subscription of books / journals / magazines / newspapers / other similar publications',
  },
  '027': {
    classification: '027',
    name: 'Reimbursement ',
  },
  '028': {
    classification: '028',
    name: 'Rental of motor vehicle',
  },
  '029': {
    classification: '029',
    name: 'EV charging facilities (Installation, rental, sale / purchase or subscription fees) ',
  },
  '030': {
    classification: '030',
    name: 'Repair and maintenance',
  },
  '031': {
    classification: '031',
    name: 'Research and development ',
  },
  '032': {
    classification: '032',
    name: 'Foreign income ',
  },
  '033': {
    classification: '033',
    name: 'Self-billed - Betting and gaming ',
  },
  '034': {
    classification: '034',
    name: 'Self-billed - Importation of goods ',
  },
  '035': {
    classification: '035',
    name: 'Self-billed - Importation of services',
  },
  '036': {
    classification: '036',
    name: 'Self-billed - Others',
  },
  '037': {
    classification: '037',
    name: 'Self-billed - Monetary payment to agents, dealers or distributors ',
  },
  '038': {
    classification: '038',
    name:
      'Sports equipment, rental / entry fees for sports facilities, registration in sports competition or sports training fees imposed by associations / sports clubs / companies registered with the Sports Commissioner or Companies Commission of Malaysia and carrying out sports activities as listed under the Sports Development Act 1997',
  },
  '039': {
    classification: '039',
    name: 'Supporting equipment for disabled person',
  },
  '040': {
    classification: '040',
    name: 'Voluntary contribution to approved provident fund ',
  },
  '041': {
    classification: '041',
    name: 'Dental examination or treatment',
  },
  '042': {
    classification: '042',
    name: 'Fertility treatment',
  },
  '043': {
    classification: '043',
    name: 'Treatment and home care nursing, daycare centres and residential care centers',
  },
  '044': {
    classification: '044',
    name: 'Vouchers, gift cards, loyalty points, etc',
  },
  '045': {
    classification: '045',
    name: 'Self-billed - Non-monetary payment to agents, dealers or distributors',
  },
};

export const SPECIAL_FIELD_NAMES = {
  COUNTRY_CODE: 'countryCode',
  STATE: 'state',
  CLASSIFICATION: 'classification',
};

export const POST_E_INVOICE_ERROR_CODES = {
  SUBMISSION_VERIFICATION_FAILED: '40002',
  IRBM_VERIFICATION_FAILED: '395528',
};
