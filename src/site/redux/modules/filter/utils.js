import _get from 'lodash/get';
import { DISPLAY_ICON_TYPES } from '../../../../utils/constants';
import { TYPES, IDS, SORT_BY_OPTION_DEFAULT_ID } from './constants';

export const transformSearchOptionList = (data, selectedOptionList) => {
  const { FUNNEL_SIMPLE, CARET_DOWN } = DISPLAY_ICON_TYPES;

  return data.map(category => {
    switch (category.type) {
      case TYPES.MULTI_SELECT:
        return {
          ...category,
          displayInfo: {
            name: category.name,
            icons: [CARET_DOWN],
          },
        };
      case TYPES.SINGLE_SELECT: {
        const selectedCategory = _get(selectedOptionList, category.id, null);
        const selectedOptionId = _get(selectedCategory, 'options[0]', '');
        const selectedOption = category.options.find(option => option.id === selectedOptionId);
        const selectedOptionName = _get(selectedOption, 'name', '');
        const isDefaultOptionSelected = selectedOptionId === SORT_BY_OPTION_DEFAULT_ID;

        return {
          ...category,
          displayInfo: {
            name: isDefaultOptionSelected ? category.name : `${category.name} ${selectedOptionName}`,
            icons: category.id === IDS.SORT_BY ? [FUNNEL_SIMPLE, CARET_DOWN] : [CARET_DOWN],
          },
        };
      }
      default:
        return {
          ...category,
          displayInfo: {
            name: category.name,
            icons: [],
          },
        };
    }
  });
};
