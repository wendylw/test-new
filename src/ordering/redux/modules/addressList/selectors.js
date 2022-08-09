import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getAddressList = state => Object.values(state.addressList.addressList.data);

export const getAddressListInitialized = state =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(state.addressList.addressList.status);
