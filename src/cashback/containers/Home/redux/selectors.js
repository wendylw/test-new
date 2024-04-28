import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getIsWebview, getIsAlipayMiniProgram } from '../../../redux/modules/common/selectors';

export const getLoadCustomerReceiptListData = state => state.cashbackHome.loadCustomerReceiptListRequest.data;

export const getLoadCustomerReceiptListLocalData = state => state.cashbackHome.loadCustomerReceiptListRequest.localData;

export const geLoadCustomerReceiptListStatus = state => state.cashbackHome.loadCustomerReceiptListRequest.status;

export const geLoadCustomerReceiptListError = state => state.cashbackHome.loadCustomerReceiptListRequest.error;

/**
 * Derived selectors
 */
export const getIsDownloadBannerShown = createSelector(
  getIsWebview,
  getIsAlipayMiniProgram,
  (isWebview, isAlipayMiniProgram) => !isWebview && !isAlipayMiniProgram
);

export const getCustomerReceiptList = createSelector(getLoadCustomerReceiptListData, loadCustomerReceiptListData =>
  _get(loadCustomerReceiptListData, 'list', [])
);

export const getIsCustomerReceiptListHasMore = createSelector(
  getLoadCustomerReceiptListLocalData,
  loadCustomerReceiptListLocalData => loadCustomerReceiptListLocalData.hasMore
);
