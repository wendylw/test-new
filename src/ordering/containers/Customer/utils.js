import Utils from '../../../utils/utils';
import { captureException } from '@sentry/react';
import { getMerchantDeliveryAddress } from '../../../utils/geoUtils';
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
    return getMerchantDeliveryAddress();
  } catch (e) {
    captureException(e);
    console.error(e);
    return null;
  }
};
