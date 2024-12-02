import { ORDER_STATUS } from '../../../common/utils/constants';

export const ORDER_PAYMENT_METHODS = {
  OFFLINE: 'Offline',
  ONLINE: 'Online',
};

export const AVAILABLE_REPORT_DRIVER_ORDER_STATUSES = [ORDER_STATUS.DELIVERED, ORDER_STATUS.PICKED_UP];

export const E_INVOICE_TYPES = {
  NOT_SUPPORTED: 'notSupported',
  REQUEST: 'request',
  VIEW: 'view',
};

/**
 * i18n info
 */
export const E_INVOICE_ENTRY_I18N_KEYS = {
  [E_INVOICE_TYPES.REQUEST]: 'RequestEInvoice',
  [E_INVOICE_TYPES.VIEW]: 'ViewEInvoice',
};
// end of i18n info
