import { createSelector } from 'reselect';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';

export const getShouldShowBackButton = createSelector(getIsWebview, isInWebview => isInWebview);
