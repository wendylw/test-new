import { createSelector } from 'reselect';
import Utils from '../../../../utils/utils';
import { getQueryString } from '../../../../common/utils';

/** Utils */
export const getIsWebview = () => Utils.isWebview();

export const getIsTNGMiniProgram = () => Utils.isTNGMiniProgram();

export const getSource = () => getQueryString('source');

export const getBusiness = () => getQueryString('business');

export const getIsWeb = createSelector(
  getIsWebview,
  getIsTNGMiniProgram,
  (isWebview, isTNGMiniProgram) => !isWebview && !isTNGMiniProgram
);

/** Router */
export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getLocationSearch = createSelector(getLocation, location => location.search);
