import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getBusinessInfo } from '../../../../../redux/modules/app';

export const getCleverTapAttributes = createSelector(getBusinessInfo, businessInfo => ({
  'store name': _get(businessInfo, 'stores.0.name', ''),
  'store id': _get(businessInfo, 'stores.0.id', ''),
}));
