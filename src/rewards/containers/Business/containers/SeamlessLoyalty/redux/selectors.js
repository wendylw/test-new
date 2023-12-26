import { getCookieVariable } from '../../../../../../common/utils';

export const getSource = () => getQueryString('source');

export const getSeamlessLoyaltyRequestId = () => getCookieVariable('__sh_rdm_reqId');
