import Constants from '../../utils/constants';
import { getPositionInfoBySource } from '../../utils/geoUtils';
import config from '../../config';
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

export const savePlaceInfo = placeInfo => {
  return localStorage.setItem('user.placeInfo', JSON.stringify(placeInfo));
};

export const removePlaceInfo = () => {
  return localStorage.removeItem('user.placeInfo');
};

export const readPlaceInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('user.placeInfo'));
  } catch (e) {
    return null;
  }
};

export const getPlaceInfoByDeviceByAskPermission = async () => {
  try {
    const placeInfo = await getPositionInfoBySource('device', true);
    await savePlaceInfo(placeInfo); // now save into localStorage
    return placeInfo;
  } catch (e) {
    console.warn(e);
  }
};

export const getPlaceInfo = async ({
  fromLocationPage = true,
  fromCache = true,
  fromDevice = true,
  fromIp = true,
  location,
} = {}) => {
  // first to use place from location picker
  let placeInfo = null;
  let source = '';
  console.log(fromLocationPage, fromCache, fromDevice, fromIp);
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
      placeInfo = readPlaceInfo();

      // --Begin-- last version of cache doesn't have addressComponents field, we need it now
      if (placeInfo && !placeInfo.addressComponents) {
        removePlaceInfo();
        placeInfo = null;
      }
      // ---End--- last version of cache doesn't have addressComponents field, we need it now

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

  savePlaceInfo(placeInfo); // now save into localStorage

  return { placeInfo, source };
};

export const submitStoreMenu = async ({ deliveryAddress, store, source, shippingType = 'delivery' }) => {
  const response = await get(Url.API_URLS.GET_STORE_HASH_DATA(store.id).url);
  const { redirectTo } = response || {};
  const storeUrlParams = {
    business: store.business,
    hash: redirectTo,
    source: source,
  };
  const redirectUrl = Utils.getMerchantStoreUrl({ ...storeUrlParams, type: shippingType });

  let form = document.createElement('form');
  let input1 = document.createElement('input');
  let input2 = document.createElement('input');

  form.action = config.beepOnlineStoreUrl(store.business) + '/go2page';
  form.method = 'POST';

  input1.name = 'target';
  input1.value = redirectUrl;
  form.appendChild(input1);

  if (!Boolean(deliveryAddress)) {
    console.error('delivery address is empty');
    return;
  }

  input2.name = 'deliveryAddress';
  input2.value = JSON.stringify(deliveryAddress);
  form.appendChild(input2);

  document.body.append(form);
  form.submit();
  document.body.removeChild(form);
};
