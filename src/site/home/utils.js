import Constants from '../../utils/constants';
import { getPositionInfoBySource } from '../../utils/geoUtils';

const { ROUTER_PATHS } = Constants;

const getPlaceInfoFromHistory = ({ history, location }) => {
  const { state = {} } = location || {};
  console.log('[Home/utils] history.location.state =', history.location.state);

  if (state.from && state.from.pathname === `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`) {
    return state.data && state.data.placeInfo;
  }

  return null;
};

export const savePlaceInfo = async placeInfo => {
  return localStorage.setItem('user.placeInfo', JSON.stringify(placeInfo));
};

export const getPlaceInfoByDeviceByAskPermission = async () => {
  try {
    const placeInfo = await getPositionInfoBySource('device', false);
    return placeInfo;
  } catch (e) {
    console.warn(e);
  }
};

export const getPlaceInfo = async ({ history, location }) => {
  // first to use place from location picker
  let placeInfo = getPlaceInfoFromHistory({ history, location });

  // todo: need to reset store list instead of refresh the whole page
  // --Begin-- to replace
  let fromLocationPage = !!placeInfo;
  if (placeInfo) {
    history.replace(location.pathname, {});
  }
  // ---End--- to replace

  // second to use last time
  if (!placeInfo) {
    try {
      placeInfo = JSON.parse(localStorage.getItem('user.placeInfo'));
    } catch (e) {
      console.warn(e);
    }
  }

  // third to use device location when there is already have permission
  // todo next phase: need a modal to ask for permission and rest currentPlaceInfo on home page
  // if (!placeInfo && !(await isDeviceGeolocationDenied())) {
  //   try {
  //     placeInfo = await getPositionInfoBySource('device');
  //   } catch (e) {
  //     console.warn(e);
  //   }
  // }

  // if not have exact location, try from IP
  if (!placeInfo) {
    try {
      // tried device with cache already, so try ip without cache now
      placeInfo = await getPositionInfoBySource('ip', false);
    } catch (e) {
      console.error(e);
    }
  }

  return { fromLocationPage, placeInfo };
};
