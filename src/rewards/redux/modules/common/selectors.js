import { createSelector } from 'reselect';
import { getQueryString, isWebview, isTNGMiniProgram, isGCashMiniProgram } from '../../../../common/utils';
import { isAlipayMiniProgram } from '../../../../common/utils/alipay-miniprogram-client';

/** Utils */
export const getIsWebview = () => isWebview();

export const getIsTNGMiniProgram = () => isTNGMiniProgram();

export const getIsGCashMiniProgram = () => isGCashMiniProgram();

export const getIsAlipayMiniProgram = () => isAlipayMiniProgram();

export const getIsWeb = () => !isWebview() && !isTNGMiniProgram();

export const getSource = () => getQueryString('source');

export const getBusiness = () => getQueryString('business');

/** Router */
export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getLocationSearch = createSelector(getLocation, location => location.search);
