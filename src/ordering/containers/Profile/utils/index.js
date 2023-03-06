import dayjs from 'dayjs';
import { isValidDate } from '../../../../utils/datetime-lib';

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
