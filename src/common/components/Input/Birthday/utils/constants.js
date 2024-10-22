import dayjs from 'dayjs';

export const DATE_PICKER_BIRTHDAY_FORMAT = 'YYYY-MM-DD';

export const BIRTHDAY_FORMAT = 'DD/MM/YYYY';

export const BIRTHDAY_DATE = {
  MIN: dayjs()
    .subtract(120, 'year')
    .format('YYYY-MM-DD'),
  MAX: dayjs().format('YYYY-MM-DD'),
};
