import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getAddressList = state => Object.values(state.addressList.addressList.data);

export const getAddressListInitialized = state =>
  state.addressList.addressList.status === API_REQUEST_STATUS.FULFILLED ||
  state.addressList.addressList.status === API_REQUEST_STATUS.REJECTED;
