import { createSelector } from 'reselect';
import { TYPES, IDS, SORT_BY_OPTION_DEFAULT_ID } from './constants';

export const getCategoryFilterList = state => state.filter.searchOptionList.data;

export const getHasAnyCategorySelected = createSelector(getCategoryFilterList, categoryFilterList =>
  categoryFilterList.some(category => category.selected)
);

export const getFilterOptionSearchParams = createSelector(getCategoryFilterList, categoryFilterList => {
  const paramArray = [];
  categoryFilterList.forEach(category => {
    const { id: key, type, selected, options = [] } = category;
    if (key === IDS.PICK_UP) return; // BEEP-1821: We DO NOT handle pick up filter here
    if (selected || key === IDS.SORT_BY) {
      const value =
        type === TYPES.TOGGLE
          ? '1'
          : options
              .filter(option => option.selected)
              .map(option => option.id)
              .join(',');
      paramArray.push(`${key}=${value}`);
    }
  });
  const defaultParams = `${IDS.SORT_BY}=${SORT_BY_OPTION_DEFAULT_ID}`;
  return paramArray.join('&') || defaultParams;
});
