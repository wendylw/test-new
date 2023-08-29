import { getPositionInfoBySource } from '../../utils/geoUtils';
import { get } from '../../utils/request';
import Url from '../../utils/url';
import Utils from '../../utils/utils';
import logger from '../../utils/monitoring/logger';
import { ADDRESS_INFO_SOURCE_TYPE } from '../../redux/modules/address/constants';

// eslint-disable-next-line consistent-return
export const getPlaceInfoByDeviceByAskPermission = async () => {
  try {
    const placeInfo = await getPositionInfoBySource(ADDRESS_INFO_SOURCE_TYPE.DEVICE, true);
    return placeInfo;
  } catch (e) {
    logger.warn('Site_Utils_GetPlaceInfoByDeviceByAskPermission', {
      message: e?.message,
    });
  }
};

export const getPlaceInfo = async ({ fromDevice = true, fromIp = true } = {}) => {
  // first to use place from location picker
  let placeInfo = null;
  let source = '';
  const { IP, DEVICE } = ADDRESS_INFO_SOURCE_TYPE;

  // third to use device location when there is already have permission
  if (!placeInfo && fromDevice) {
    try {
      placeInfo = await getPositionInfoBySource(DEVICE, true);
      if (placeInfo) source = DEVICE;
    } catch (e) {
      logger.warn('Site_Utils_GetPlaceInfo', {
        message: e?.message,
      });
    }
  }

  // if not have exact location, try from IP
  if (!placeInfo && fromIp) {
    try {
      // tried device with cache already, so try ip without cache now
      placeInfo = await getPositionInfoBySource(IP, false);
      if (placeInfo) source = IP;
    } catch (e) {
      logger.error('Site_Utils_GetPlaceInfoFailed', {
        message: e?.message,
      });
    }
  }

  return { placeInfo, source };
};

export const submitStoreMenu = async ({ deliveryAddress, store, source, shippingType = 'delivery' }) => {
  logger.log('Site_Utils_ClickStore', {
    name: store.business,
    source,
  });

  const response = await get(Url.API_URLS.GET_STORE_HASH_DATA(store.id).url);
  const { redirectTo } = response || {};
  const storeUrlParams = {
    business: store.business,
    hash: redirectTo,
    source,
  };
  const redirectUrl = Utils.getMerchantStoreUrl({ ...storeUrlParams, type: shippingType });

  if (!deliveryAddress) {
    logger.error('Site_Utils_GoToStoreFailedByEmptyDeliveryAddress');
    console.error('delivery address is empty');
    return;
  }

  Utils.submitForm('/go2page', {
    target: redirectUrl,
    deliveryAddress: JSON.stringify(deliveryAddress),
  });
};
