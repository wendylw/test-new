import config from '../../../../../config';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';

export const TERMS_AND_CONDITION_URL = `${config.beepitComUrl}${PATH_NAME_MAPPING.TERMS_OF_USE}`;

export const CUSTOMER_NOT_FOUND_ERROR_CODE = '395271';

export const REWARDS_NAMES = {
  POINTS: 'points',
  CASHBACK: 'cashback',
  STORE_CREDITS: 'storeCredits',
};

export const GET_REWARDS_ESTIMATION_ERROR_CODES = {
  EXPIRED: '41032',
  NO_TRANSACTION: '41028',
  ORDER_CANCELED_REFUND: '41030',
};
