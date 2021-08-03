import Utils from '../../../utils/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';
import { captureException } from '@sentry/react';
export const DeliveryDetailsStorageKey = 'deliveryDetails';

export const updateDeliveryDetails = async fields => {
  return sessionStorage.setItem(DeliveryDetailsStorageKey, JSON.stringify(fields));
};

export const patchDeliveryDetails = async fields => {
  const deliveryDetails = await fetchDeliveryDetails();
  return Utils.setSessionVariable(
    DeliveryDetailsStorageKey,
    JSON.stringify({
      ...deliveryDetails,
      ...fields,
    })
  );
};

export const fetchDeliveryDetails = async () => {
  try {
    return JSON.parse(Utils.getSessionVariable(DeliveryDetailsStorageKey));
  } catch (e) {
    captureException(e);
    console.error(e);
    return null;
  }
};

export const fetchDeliveryAddress = async () => {
  try {
    return JSON.parse(Utils.getSessionVariable('deliveryAddress'));
  } catch (e) {
    captureException(e);
    console.error(e);
    return null;
  }
};

export const findAvailableAddressById = (addressList, addressId) =>
  addressList.find(address => address.availableStatus && address._id === addressId);

export const findNearbyAvailableAddress = (addressList, location, maxDistance = 500 /* unit: m */) =>
  addressList.find(
    address =>
      address.availableStatus &&
      computeStraightDistance(
        {
          lng: address.location.longitude,
          lat: address.location.latitude,
        },
        {
          lng: location.longitude,
          lat: location.latitude,
        }
      ) <= maxDistance
  );
