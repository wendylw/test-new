import { createSelector } from 'reselect';
import { isWebview } from '../../../../common/utils';
import { getIsAliMiniProgram } from '../../../../common/utils/alipay-miniprogram-client';

/** Utils */
export const getIsWebview = () => isWebview();

export const getIsAliMiniProgram = () => getIsAliMiniProgram();

export const getIsWeb = createSelector(
  getIsWebview,
  getIsTNGMiniProgram,
  (isWebview, isTNGMiniProgram) => !isWebview && !isTNGMiniProgram
);

/** Router */
export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getLocationSearch = createSelector(getLocation, location => location.search);
