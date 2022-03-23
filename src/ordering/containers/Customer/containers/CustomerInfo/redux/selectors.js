import _isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import { getDeliveryDetails } from '../../../../../redux/modules/app';
import { getAddressList } from '../../../../../redux/modules/addressList/selectors';

export const getCustomerError = state => state.customer.customerInfo.customerError;

export const getShouldGoToAddNewAddressPage = createSelector(
  getAddressList,
  getDeliveryDetails,
  (addressList, deliveryDetails) => _isEmpty(deliveryDetails.addressName) && _isEmpty(addressList)
);
