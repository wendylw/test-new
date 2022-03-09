import { computeStraightDistance } from '../../../utils/geoUtils';

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
