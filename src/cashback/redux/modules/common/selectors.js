import { isWebview } from '../../../../common/utils';
import { isAlipayMiniProgram } from '../../../../common/utils/alipay-miniprogram-client';

/** Utils */
export const getIsWebview = () => isWebview();

export const getIsAlipayMiniProgram = () => isAlipayMiniProgram();
