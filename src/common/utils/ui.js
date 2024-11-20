import _debounce from 'lodash/debounce';

export const getClassName = classList => classList.filter(className => !!className).join(' ');

export const searchUpdateDebounce = _debounce((value, callback) => callback(value), 700);
