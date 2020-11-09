import Constants from '../../utils/constants';
import { getPositionInfoBySource, loadPickedDeliveryAddress, savePickedDeliveryAddress } from '../../utils/geoUtils';
import { get } from '../../utils/request';
import Url from '../../utils/url';
import Utils from '../../utils/utils';

const { ROUTER_PATHS } = Constants;

const getPlaceInfoFromLocation = ({ location }) => {
  const { state = {} } = location || {};

  if (state.from && state.from.pathname === `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`) {
    return state.data && state.data.placeInfo;
  }

  return null;
};

export const migrateSavedPlaceInfo = async () => {
  try {
    const oldPlaceInfoStr = localStorage.getItem('user.placeInfo');
    if (oldPlaceInfoStr) {
      const placeInfo = JSON.stringify(oldPlaceInfoStr);
      savePickedDeliveryAddress(placeInfo);
    }
  } catch (e) {
    console.error(e.message);
  }
};

export const getPlaceInfoByDeviceByAskPermission = async () => {
  try {
    const placeInfo = await getPositionInfoBySource('device', true);
    await savePickedDeliveryAddress(placeInfo); // now save into localStorage
    return placeInfo;
  } catch (e) {
    console.warn(e);
  }
};

export const getPlaceInfo = async (options = {}) => {
  const { fromLocationPage = true, fromCache = true, fromDevice = true, fromIp = true, location } = options;
  // first to use place from location picker
  let placeInfo = null;
  let source = '';
  if (!placeInfo && fromLocationPage) {
    if (location) {
      placeInfo = getPlaceInfoFromLocation({ location });
    }
    if (placeInfo) {
      source = 'location-page';
    }
  }
  if (!placeInfo && fromCache) {
    try {
      placeInfo = await loadPickedDeliveryAddress();

      if (placeInfo) {
        source = 'cache';
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // third to use device location when there is already have permission
  if (!placeInfo && fromDevice) {
    try {
      placeInfo = await getPositionInfoBySource('device', true);
      if (placeInfo) {
        source = 'device';
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // if not have exact location, try from IP
  if (!placeInfo && fromIp) {
    try {
      // tried device with cache already, so try ip without cache now
      placeInfo = await getPositionInfoBySource('ip', false);
      if (placeInfo) source = 'ip';
    } catch (e) {
      console.error(e);
    }
  }

  await savePickedDeliveryAddress(placeInfo); // now save into localStorage

  return { placeInfo, source };
};

export const submitStoreMenu = async ({ store, source, shippingType = 'delivery' }) => {
  const response = await get(Url.API_URLS.GET_STORE_HASH_DATA(store.id).url);
  const { redirectTo } = response || {};
  const storeUrlParams = {
    business: store.business,
    hash: redirectTo,
    source: source,
  };
  document.location.href = Utils.getMerchantStoreUrl({ ...storeUrlParams, type: shippingType });
};
