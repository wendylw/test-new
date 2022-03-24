import { createAsyncThunk } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import { actions as appActions, getShippingType } from '../../../../../redux/modules/app';
import Constants from '../../../../../../utils/constants';
import { getAddressList } from '../../../../../redux/modules/addressList/selectors';
import { getAddressCoords } from '../../../../../../redux/modules/address/selectors';
import { loadAddressList } from '../../../../../redux/modules/addressList/thunks';
import { findNearbyAvailableAddress } from '../../../utils';

const { DELIVERY_METHOD } = Constants;

export const selectAvailableAddress = createAsyncThunk(
  'ordering/customer/common/selectAvailableAddress',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const shippingType = getShippingType(state);

    if (shippingType !== DELIVERY_METHOD.DELIVERY) {
      return;
    }

    const deliveryCoords = getAddressCoords(state);
    const longitude = _get(deliveryCoords, 'lng', 0);
    const latitude = _get(deliveryCoords, 'lat', 0);

    const availableAddress = await (async () => {
      if (deliveryCoords) {
        await dispatch(loadAddressList());
        const addressList = getAddressList(getState());
        return findNearbyAvailableAddress(addressList, { longitude, latitude });
      }

      return null;
    })();

    dispatch(
      appActions.updateDeliveryDetails({
        username: _get(availableAddress, 'contactName', ''),
        phone: _get(availableAddress, 'contactNumber', ''),
        addressId: _get(availableAddress, '_id', ''),
        addressName: _get(availableAddress, 'addressName', ''),
        addressDetails: _get(availableAddress, 'addressDetails', ''),
        deliveryComments: _get(availableAddress, 'comments', ''),
        deliveryToAddress: _get(availableAddress, 'deliveryTo', ''),
        deliveryToLocation: _get(availableAddress, 'location', null),
        deliveryToCity: _get(availableAddress, 'city', ''),
        postCode: _get(availableAddress, 'postCode', ''),
        countryCode: _get(availableAddress, 'countryCode', ''),
      })
    );
  }
);
