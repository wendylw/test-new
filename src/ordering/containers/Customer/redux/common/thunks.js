import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  actions as appActions,
  getUserConsumerId,
  getStoreId,
  getDeliveryDetails,
  getShippingType,
} from '../../../../redux/modules/app';
import { fetchAddressList } from './api-request';
import { DELIVERY_METHOD } from '../../../../../utils/constants';
import { getAddressList } from './selectors';
import { findAvailableAddressById, findNearbyAvailableAddress } from '../../utils';
import Utils from '../../../../../utils/utils';

export const loadAddressList = createAsyncThunk('ordering/customer/common/loadAddressList', async (_, { getState }) => {
  const state = getState();
  const consumerId = getUserConsumerId(state);
  const storeId = getStoreId(state);

  return fetchAddressList(consumerId, storeId);
});

export const selectAvailableAddress = createAsyncThunk(
  'ordering/customer/common/selectAvailableAddress',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const deliveryDetails = getDeliveryDetails(state);
    const shippingType = getShippingType(state);

    if (shippingType !== DELIVERY_METHOD.DELIVERY) {
      return;
    }

    if (deliveryDetails.addressId) {
      return;
    }

    const deliveryCoords = Utils.getDeliveryCoords();

    await dispatch(loadAddressList());

    const addressList = getAddressList(getState());

    const addressIdFromNative = sessionStorage.getItem('addressIdFromNative');

    const availableAddress = (() => {
      if (addressIdFromNative) {
        return findAvailableAddressById(addressList, addressIdFromNative);
      }

      if (deliveryCoords) {
        return findNearbyAvailableAddress(addressList, {
          longitude: deliveryCoords.lng,
          latitude: deliveryCoords.lat,
        });
      }

      return null;
    })();

    if (!availableAddress) {
      return;
    }

    const {
      _id,
      addressName,
      addressDetails,
      comments: deliveryComments,
      deliveryTo: deliveryToAddress,
      location: deliveryToLocation,
      city: deliveryToCity,
    } = availableAddress;

    dispatch(
      appActions.updateDeliveryDetails({
        addressId: _id,
        addressName,
        addressDetails,
        deliveryComments,
        deliveryToAddress,
        deliveryToLocation,
        deliveryToCity,
      })
    );
  }
);
