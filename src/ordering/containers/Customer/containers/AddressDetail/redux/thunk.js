import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDeliveryDetails, getUserName, getUserPhone } from '../../../../../redux/modules/app';
import Utils from '../../../../../../utils/utils';

export const init = createAsyncThunk('ordering/customer/addressDetail', async ({ actionType }, { getState }) => {
  const state = getState();
  const deliveryDetails = getDeliveryDetails(state);
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
    contactNumber: '',
  };

  // if choose a new location, update the addressInfo
  payload.address = address;
  payload.coords = {
    latitude: coords.lat,
    longitude: coords.lng,
  };
  payload.addressComponents = addressComponents;

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
    const userName = getUserName(getState());
    const userPhone = getUserPhone(getState());
    payload.contactName = userName;
    payload.contactNumber = userPhone;
    payload.address = address;
    payload.coords = { longitude: coords.lng, latitude: coords.lat };
    payload.addressComponents = addressComponents;
  }
  return payload;
});
