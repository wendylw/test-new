import { isValidDate, getFormatLocaleDateTime } from '../../../../utils/datetime-lib';

export const getRequestBirthdayData = birthday => {
  if (!isValidDate(new Date(birthday))) {
    return birthday;
  }

  return getFormatLocaleDateTime({ dateTime: birthday, formatter: 'YYYY/MM/DD' });
};
