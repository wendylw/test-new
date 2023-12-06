import { createSelector } from 'reselect';
import Utils from '../../../../utils/utils';

/** Utils */
export const getIsWebview = () => Utils.isWebview();

export const getIsTNGMiniProgram = () => Utils.isTNGMiniProgram();

/** Router */
export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getLocationSearch = createSelector(getLocation, location => location.search);
