import _once from 'lodash/once';
import { isSafari, isTNGMiniProgram, isGCashMiniProgram, judgeClient } from '../../../../utils';
import {
  isValidDate,
  getFormatLocaleDateTime,
  getSwitchFormatDate,
  getDateISOString,
} from '../../../../../utils/datetime-lib';
import { BIRTHDAY_FORMAT, DATE_PICKER_BIRTHDAY_FORMAT } from './constants';

export const getIsSupportedShowPicker = _once(() => {
  // isDateInputSupported Method from: https://gomakethings.com/how-to-check-if-a-browser-supports-native-input-date-pickers/
  // if want to do more fallback can check: https://developer.chrome.com/blog/show-picker/
  const input = document.createElement('input');
  const value = 'test date text value';

  input.setAttribute('type', 'date');
  input.setAttribute('value', value);

  const isDateInputSupported = input.value !== value;

  if (!isDateInputSupported) {
    return false;
  }

  if (!('showPicker' in HTMLInputElement.prototype)) {
    return false;
  }

  return true;
});

// If browser is Safari or iOS TNG, showPicker() can not be execute
// For date input can be click in Safari or iOS TNG
export const getIsDateInputOnUpperLayer = _once(() => {
  if (isSafari()) {
    return true;
  }

  if (judgeClient() === 'iOS' && (isTNGMiniProgram() || isGCashMiniProgram())) {
    return true;
  }

  return false;
});

export const getFormatBirthdayData = birthday => {
  if (!isValidDate(new Date(birthday))) {
    return birthday;
  }

  return getFormatLocaleDateTime({ dateTime: birthday, formatter: BIRTHDAY_FORMAT });
};

export const getSwitchFormatBirthdayDate = birthday => {
  if (!isValidDate(new Date(birthday))) {
    return birthday;
  }

  return getSwitchFormatDate(birthday, BIRTHDAY_FORMAT, DATE_PICKER_BIRTHDAY_FORMAT);
};

export const getBirthdayDateISODate = birthday => {
  if (!isValidDate(new Date(birthday))) {
    return birthday;
  }

  return getDateISOString(birthday);
};
