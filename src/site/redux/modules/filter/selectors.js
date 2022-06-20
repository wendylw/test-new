import { createSelector } from 'reselect';
import _get from 'lodash/get';
import { TYPES, IDS, SORT_BY_OPTION_DEFAULT_ID } from './constants';

export const getSearchOptionList = state => state.filter.searchOptionList.data;

export const getSelectedOptionList = state => state.filter.selectedOptionList.data;

export const getCategoryFilterList = createSelector(
  getSearchOptionList,
  getSelectedOptionList,
  (searchOptionList, selectedOptionList) =>
    searchOptionList.map(category => {
      const selectedCategory = _get(selectedOptionList, category.id, null);
      const selectedOptionIds = _get(selectedCategory, 'options', []);
      const hasCategorySelected = !!selectedCategory;

      switch (category.type) {
        case TYPES.MULTI_SELECT:
          return {
            ...category,
            selected: hasCategorySelected,
            options: category.options.map(option => ({ ...option, selected: selectedOptionIds.includes(option.id) })),
          };
        case TYPES.SINGLE_SELECT: {
          const selectedOptionId = _get(selectedCategory, 'options[0]', '');
          const selectedOption = category.options.find(option => option.id === selectedOptionId);
          const selectedOptionName = _get(selectedOption, 'name', '');
          const isDefaultOptionSelected = selectedOptionId === SORT_BY_OPTION_DEFAULT_ID;

          return {
            ...category,
            selected: !isDefaultOptionSelected,
            options: category.options.map(option => ({ ...option, selected: selectedOptionIds.includes(option.id) })),
            displayInfo: {
              ...category.displayInfo,
              name: isDefaultOptionSelected ? category.name : `${category.name} ${selectedOptionName}`,
            },
          };
        }
        default:
          return {
            ...category,
            selected: hasCategorySelected,
          };
      }
    })
);

export const getHasAnyCategorySelected = createSelector(getCategoryFilterList, categoryFilterList =>
  categoryFilterList.some(category => {
    if (category.type === TYPES.SINGLE_SELECT) {
      return category.options.some(option => option.selected && option.id !== SORT_BY_OPTION_DEFAULT_ID);
    }
    return category.selected;
  })
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
