import Constants from '../../utils/constants';
import { getDevicePositionInfo } from '../../utils/geoUtils';

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

  // finally to use device location
  if (!placeInfo) {
    try {
      placeInfo = await getDevicePositionInfo();
    } catch (e) {
      console.warn(e);
    }
  }

  return { fromLocationPage, placeInfo };
};
