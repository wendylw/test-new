import dayjs from 'dayjs';
import { isValidDate } from '../../../../utils/datetime-lib';

export const isValidBirthdayDateString = birthday => {
  const birthdayDateRegex = /^(\d{1,2})(\/)(\d{1,2})(\/)(\d{1,4})$/;
  const matchedBirthday = birthday.match(birthdayDateRegex);

  if (!matchedBirthday) {
    return false;
  }

  const internalBirthdayDate = `${matchedBirthday[5]}/${matchedBirthday[3]}/${matchedBirthday[1]}`;

  return isValidDate(new Date(internalBirthdayDate));
};

export const isAfterTodayBirthdayDate = birthday => dayjs(birthday).isAfter(dayjs());
