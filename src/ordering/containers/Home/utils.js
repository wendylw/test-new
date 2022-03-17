import config from '../../../config';
import { get } from '../../../utils/request';
import Utils from '../../../utils/utils';
import { PROMOTION_CLIENT_TYPES } from '../../../utils/constants';

// todo: this should be global use
export const fetchRedirectPageState = async () => {
  try {
    const beepSiteUrl = config.beepitComUrl;
    return await get(`${beepSiteUrl}/go2page/state`);
  } catch (e) {
    console.error(e);
    return {};
  }
};

export const windowSize = () => ({
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight,
});

export const mainTop = ({ headerEls = [] }) => {
  let top = 0;

  if (headerEls.length) {
    headerEls.forEach(headerEl => {
      top += headerEl ? headerEl.clientHeight || headerEl.offsetHeight : 0;
    });
  }

  return top;
};

export const marginBottom = ({ footerEls = [] }) => {
  let bottom = 0;

  if (footerEls.length) {
    footerEls.forEach(footerEl => {
      bottom += footerEl ? footerEl.clientHeight || footerEl.offsetHeight : 0;
    });
  }

  return bottom;
};

export const getCurrentPromotionClientType = () => {
  if (Utils.isTNGMiniProgram()) {
    return PROMOTION_CLIENT_TYPES.TNG_MINI_PROGRAM;
  }

  if (Utils.isWebview()) {
    return PROMOTION_CLIENT_TYPES.APP;
  }

  return PROMOTION_CLIENT_TYPES.WEB;
};

export const isSameAddressCoords = (thisCoords, anotherCoords) => {
  const { lat: thisLat, lng: thisLng } = thisCoords || {};
  const { lat: anotherLat, lng: anotherLng } = anotherCoords || {};

  return thisLat === anotherLat && thisLng === anotherLng;
};
