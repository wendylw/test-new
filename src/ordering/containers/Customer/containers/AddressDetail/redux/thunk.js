import { createAsyncThunk } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import { getDeliveryDetails } from '../../../../../redux/modules/app';
import {
  getAddressFullName,
  getAddressCoords,
  getAddressCity,
  getAddressPostCode,
  getAddressCountryCode,
} from '../../../../../../redux/modules/address/selectors';
import { getAddressInfo } from './selectors';

export const init = createAsyncThunk(
  'ordering/customer/addressDetail',
  async ({ actionType, selectedAddress }, { getState }) => {
    const state = getState();
    const deliveryDetails = getDeliveryDetails(state);
    const addressDetails = getAddressInfo(state);
    const {
      addressId,
      addressName,
      deliveryToAddress,
      addressDetails: details,
      deliveryComments,
      username,
      phone,
      deliveryToLocation,
      deliveryToCity,
      postCode,
      countryCode,
    } = deliveryDetails || {};

    const payload = {
      id: '',
      type: actionType,
      address: '',
      coords: null,
      name: '',
      details: '',
      comments: '',
      contactName: '',
      contactNumber: '',
      city: '',
      postCode: '',
      countryCode: '',
    };

    if (actionType === 'edit') {
      payload.id = addressId;
      payload.name = _get(addressDetails, 'name', '') || addressName;
      payload.address = _get(selectedAddress, 'fullName', null) || deliveryToAddress;
      payload.details = _get(addressDetails, 'details', '') || details;
      payload.comments = _get(addressDetails, 'comments', '') || deliveryComments;
      const longitude = _get(selectedAddress, 'coords.lng', 0) || _get(deliveryToLocation, 'lng', 0);
      const latitude = _get(selectedAddress, 'coords.lat', 0) || _get(deliveryToLocation, 'lat', 0);
      payload.coords = { longitude, latitude };
      payload.contactName = _get(addressDetails, 'contactName', '') || username;
      payload.contactNumber = _get(addressDetails, 'contactNumber', '') || phone;
      payload.city = _get(selectedAddress, 'city', '') || deliveryToCity;
      payload.postCode = _get(selectedAddress, 'postCode', '') || postCode;
      payload.countryCode = _get(selectedAddress, 'countryCode', '') || countryCode;
    }

    if (actionType === 'add') {
      payload.name = _get(addressDetails, 'name', '');
      payload.address = _get(selectedAddress, 'fullName', null) || getAddressFullName(state);
      payload.details = _get(addressDetails, 'details', '');
      payload.comments = _get(addressDetails, 'comments', '');
      const coords = getAddressCoords(state);
      const longitude = _get(selectedAddress, 'coords.lng', 0) || _get(coords, 'lng', 0);
      const latitude = _get(selectedAddress, 'coords.lat', 0) || _get(coords, 'lat', 0);
      payload.coords = { longitude, latitude };
      payload.contactName = _get(addressDetails, 'contactName', '') || username;
      payload.contactNumber = _get(addressDetails, 'contactNumber', '') || phone;
      payload.city = _get(selectedAddress, 'city', '') || getAddressCity(state);
      payload.postCode = _get(selectedAddress, 'postCode', '') || getAddressPostCode(state);
      payload.countryCode = _get(selectedAddress, 'countryCode', '') || getAddressCountryCode(state);
    }

    return payload;
  }
);

export const completePhoneNumber = createAsyncThunk('ordering/customer/completePhoneNumber', async isValid => isValid);
