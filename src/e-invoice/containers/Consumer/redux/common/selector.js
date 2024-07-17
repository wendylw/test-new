import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../common/utils';
import { E_INVOICE_TYPES } from '../../../../utils/constants';

export const getType = () => getQueryString('type');

export const getIsMalaysianType = createSelector(getType, type => type === E_INVOICE_TYPES.MALAYSIAN);
