import { createSelector } from 'reselect';
import { getCookieVariable } from '../../../../../../common/utils';
import { getCustomerTier } from '../../../../../redux/modules/customer/selectors';

export const getSource = () => getQueryString('source');

export const getSeamlessLoyaltyRequestId = () => getCookieVariable('__sh_rdm_reqId');

export const getIsMember = createSelector(getCustomerTier, customerTier => Boolean(customerTier));
