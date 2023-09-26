import _isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import { getDeliveryDetails, getIsAlipayMiniProgram } from '../../../../../redux/modules/app';
import { getAddressList } from '../../../../../redux/modules/addressList/selectors';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';

export const getCustomerError = state => state.customer.customerInfo.customerError;

export const getShouldGoToAddNewAddressPage = createSelector(
  getAddressList,
  getDeliveryDetails,
  (addressList, deliveryDetails) => _isEmpty(deliveryDetails.addressName) && _isEmpty(addressList)
);

export const getSelectAvailableAddressStatus = state => state.customer.customerInfo.selectAvailableAddress.status;

export const getIsSelectAvailableAddressRequestCompleted = createSelector(
  getSelectAvailableAddressStatus,
  status => status === API_REQUEST_STATUS.FULFILLED || status === API_REQUEST_STATUS.REJECTED
);

// FB-4206: TnG or GCash MP won't go to the payment page
export const getIsDisabledWebPayment = createSelector(
  getIsAlipayMiniProgram,
  isAlipayMiniProgram => isAlipayMiniProgram
);
