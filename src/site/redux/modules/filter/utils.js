import { DISPLAY_ICON_TYPES } from '../../../../utils/constants';
import { TYPES, IDS, SORT_BY_OPTION_DEFAULT_ID } from './constants';

export const transformSearchOptionList = data => {
  const { FUNNEL_SIMPLE, CARET_DOWN } = DISPLAY_ICON_TYPES;

  return data.map(category => {
    switch (category.type) {
      case TYPES.MULTI_SELECT:
        return {
          ...category,
          selected: false,
          options: category.options.map(option => ({ ...option, selected: false })),
          displayInfo: {
            name: category.name,
            icons: [CARET_DOWN],
          },
        };
      case TYPES.SINGLE_SELECT:
        return {
          ...category,
          selected: false,
          options: category.options.map(option => {
            if (category.id === IDS.SORT_BY && option.id === SORT_BY_OPTION_DEFAULT_ID) {
              return { ...option, selected: true };
            }
            return { ...option, selected: false };
          }),
          displayInfo: {
            name: category.name,
            icons: category.id === IDS.SORT_BY ? [FUNNEL_SIMPLE, CARET_DOWN] : [CARET_DOWN],
          },
        };
      default:
        return {
          ...category,
          selected: false,
          displayInfo: {
            name: category.name,
            icons: [],
          },
        };
    }
  });
};
