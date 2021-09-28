import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDeliveryDetails } from '../../../../../redux/modules/app';
import Utils from '../../../../../../utils/utils';
import { getAddressInfo } from './selectors';

export const init = createAsyncThunk('ordering/customer/addressDetail', ({ actionType }, { getState }) => {
  const state = getState();
  const deliveryDetails = getDeliveryDetails(state);
  const addressInfo = getAddressInfo(state);
  const {
    addressId,
    addressName,
    deliveryToAddress,
    addressDetails,
    deliveryComments,
    username,
    phone,
    deliveryToLocation,
    deliveryToCity,
  } = deliveryDetails || {};

  const { address: savedAddress, coords: savedCoords, addressComponents: savedAddressComponents } = addressInfo || {};
  const { address, coords, addressComponents } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
  const payload = {
    id: '',
    type: actionType,
    address: '',
    coords: null,
    addressComponents: null,
    name: '',
    details: '',
    comments: '',
    contactName: '',
    contactNumber: null,
  };

  // if choose a new location, update the addressInfo
  if (
    address !== savedAddress ||
    coords.lat !== savedCoords.latitude ||
    coords.lng !== savedCoords.longitude ||
    addressComponents.city !== savedAddressComponents.city
  ) {
    payload.address = address;
    payload.coords = {
      latitude: coords.lat,
      longitude: coords.lng,
    };
    payload.addressComponents = addressComponents;
  }

  if (actionType === 'edit') {
    payload.id = addressId;
    payload.name = addressName;
    payload.address = deliveryToAddress;
    payload.details = addressDetails;
    payload.comments = deliveryComments;
    payload.coords = deliveryToLocation;
    payload.contactName = username;
    payload.contactNumber = phone;
    payload.addressComponents = {
      ...addressComponents,
      city: deliveryToCity,
    };
  }

  if (actionType === 'add') {
    payload.contactName = username;
    payload.contactNumber = phone;
    payload.address = address;
    payload.coords = { longitude: coords.lng, latitude: coords.lat };
    payload.addressComponents = addressComponents;
  }
  return payload;
});
