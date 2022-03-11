import { createAsyncThunk } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import { actions as appActions, getShippingType } from '../../../../redux/modules/app';
import Constants from '../../../../../utils/constants';
import { getAddressDetails } from '../../containers/CustomerInfo/redux/selectors';
import { getAddressList } from '../../../../redux/modules/addressList/selectors';
import { getAddressCoords, getSavedAddressId } from '../../../../../redux/modules/address/selectors';
import { loadAddressList } from '../../../../redux/modules/addressList/thunks';
import { loadAddressDetails } from '../../containers/CustomerInfo/redux/thunks';
import { findNearbyAvailableAddress } from '../../utils';

const { DELIVERY_METHOD } = Constants;

export const selectAvailableAddress = createAsyncThunk(
  'ordering/customer/common/selectAvailableAddress',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const shippingType = getShippingType(state);

    if (shippingType !== DELIVERY_METHOD.DELIVERY) {
      return;
    }

    const savedAddressId = getSavedAddressId(state);
    const deliveryCoords = getAddressCoords(state);
    const longitude = _get(deliveryCoords, 'lng', 0);
    const latitude = _get(deliveryCoords, 'lat', 0);

    const availableAddress = await (async () => {
      if (savedAddressId) {
        // If a saved address has been selected, no need to find other addresses.
        // eslint-disable-next-line no-underscore-dangle
        await dispatch(loadAddressDetails());
        const addressDetails = getAddressDetails(getState());
        const isAddressAvailable = _get(addressDetails, 'availableStatus', false);
        if (isAddressAvailable) return addressDetails;
      }

      if (deliveryCoords) {
        await dispatch(loadAddressList());
        const addressList = getAddressList(getState());
        return findNearbyAvailableAddress(addressList, { longitude, latitude });
      }

      return null;
    })();

    dispatch(
      appActions.updateDeliveryDetails({
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
