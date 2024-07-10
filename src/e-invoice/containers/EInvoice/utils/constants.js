import { E_INVOICE_STATUS } from '../../../utils/constants';

export const PAGE_HTML_ID = {
  key: 'id',
  value: 'e-invoice-html',
};

export const GET_E_INVOICE_ERROR_CODES = {
  ORDER_NOT_FOUND: '41028',
  ORDER_CANCELLED_OR_REFUNDED: '41030',
};

export const STATUS_TAG_COLORS = {
  [E_INVOICE_STATUS.CANCEL]: null,
  [E_INVOICE_STATUS.SUBMITTED]: null,
  [E_INVOICE_STATUS.VALID]: 'green',
  [E_INVOICE_STATUS.REJECT]: 'red',
};

export const STATUS_I18N_KEYS = {
  [E_INVOICE_STATUS.CANCEL]: 'Canceled',
  [E_INVOICE_STATUS.SUBMITTED]: 'Submitted',
  [E_INVOICE_STATUS.VALID]: 'Validated',
  [E_INVOICE_STATUS.REJECT]: 'Rejected',
};
