import { createSelector } from 'reselect';
import { getQueryString, isWebview, isTNGMiniProgram } from '../../../../common/utils';

/** Utils */
export const getIsWebview = () => isWebview();

export const getIsTNGMiniProgram = () => isTNGMiniProgram();

export const getIsWeb = () => !isWebview() && !isTNGMiniProgram();

export const getSource = () => getQueryString('source');

export const getBusiness = () => getQueryString('business');

/** Router */
export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getLocationSearch = createSelector(getLocation, location => location.search);
