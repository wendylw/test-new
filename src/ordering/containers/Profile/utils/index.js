import dayjs from 'dayjs';
import { isValidDate } from '../../../../utils/datetime-lib';
import { isSafari, isTNGMiniProgram } from '../../../../common/utils';
// TODO: Migrate to v2
import Utils from '../../../../utils/utils';

export const getIsSupportedShowPicker = () => {
  // isDateInputSupported Method from: https://gomakethings.com/how-to-check-if-a-browser-supports-native-input-date-pickers/
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
};

export const getIsUpDateInputDOMLayer = () => {
  if (isSafari()) {
    return true;
  }

  // TODO: Migrate to isAlipayMiniProgram()
  if (Utils.judgeClient() === 'iOS' && isTNGMiniProgram()) {
    return true;
  }

  return false;
};

const getMatchedBirthdayGroups = birthday => {
  const birthdayDateRegex = /^(?<day>\d{1,2})\/(?<month>\d{1,2})\/(?<year>\d{1,4})$/;

  const { groups } = birthday.match(birthdayDateRegex) || {};

  return groups;
};

export const isValidBirthdayDateString = birthday => {
  const matchedBirthdayGroups = getMatchedBirthdayGroups(birthday);

  if (!matchedBirthdayGroups) {
    return false;
  }

  const { day, month, year } = matchedBirthdayGroups;
  const internalBirthdayDate = `${year}/${month}/${day}`;

  return isValidDate(new Date(internalBirthdayDate));
};

export const getRequestBirthdayData = birthday => {
  const matchedBirthdayGroups = getMatchedBirthdayGroups(birthday);

  if (!matchedBirthdayGroups) {
    return birthday;
  }

  const { day, month, year } = matchedBirthdayGroups;

  return `${year}/${month}/${day}`;
};

export const isAfterTodayBirthdayDate = birthday => {
  const matchedBirthdayGroups = getMatchedBirthdayGroups(birthday);

  if (!matchedBirthdayGroups) {
    return true;
  }

  const { day, month, year } = matchedBirthdayGroups;

  return dayjs(`${year}-${month}-${day}`).isAfter(dayjs());
};
