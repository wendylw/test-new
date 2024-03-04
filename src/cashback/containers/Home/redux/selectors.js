import _get from 'lodash/get';
import { createSelector } from 'reselect';

export const getLoadCustomerReceiptListData = state => state.cashbackHome.loadCustomerReceiptListRequest.data;

export const geLoadCustomerReceiptListStatus = state => state.cashbackHome.loadCustomerReceiptListRequest.status;

export const geLoadCustomerReceiptListError = state => state.cashbackHome.loadCustomerReceiptListRequest.error;

/**
 * Derived selectors
 */
export const getCustomerReceiptList = createSelector(getLoadCustomerReceiptListData, loadCustomerReceiptListData =>
  _get(loadCustomerReceiptListData, 'list', [])
);

export const getIsCustomerReceiptListHasMore = createSelector(
  getCustomerReceiptList,
  customerReceiptList => customerReceiptList.length !== 0
);
