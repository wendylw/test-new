import dayjs from 'dayjs';
import { isValidDate } from '../../../../utils/datetime-lib';

export const isValidBirthdayDateString = birthday => {
  const birthdayDateRegex = /^(?<day>\d{1,2})\/(?<month>\d{1,2})\/(?<year>\d{1,4})$/;
  const { groups: matchedBirthdayGroups } = birthday.match(birthdayDateRegex) || {};

  if (!matchedBirthdayGroups) {
    return false;
  }

  const { day, month, year } = matchedBirthdayGroups;
  const internalBirthdayDate = `${year}/${month}/${day}`;

  return isValidDate(new Date(internalBirthdayDate));
};

export const isAfterTodayBirthdayDate = birthday => dayjs(birthday).isAfter(dayjs());
