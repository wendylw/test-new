import Utils from '../../../utils/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';
import { captureException } from '@sentry/react';

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
