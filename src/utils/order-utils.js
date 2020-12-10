import * as timeLib from './time-lib';
/**
 * get the time is available order time
 * @param {Dayjs} dateTime
 * @param {object} param1
 */
export const isAvailableOrderTime = (
  dateTime,
  { validDays, validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo, vacations }
) => {
  return (
    isInValidDays(dateTime, validDays) &&
    isInValidTime(dateTime, { validTimeFrom, validTimeTo }) &&
    !isInBreakTime(dateTime, { breakTimeFrom, breakTimeTo }) &&
    !isInVacations(dateTime, vacations)
  );
};

export const isInValidDays = (dateTime, validDays) => {
  if (!validDays) {
    return false;
  }

  const day = dateTime.day();
  return validDays.includes(day);
};

export const isInValidTime = (dateTime, { validTimeFrom, validTimeTo }) => {
  if (!timeLib.isValidTime(validTimeFrom) || !timeLib.isValidTime(validTimeTo)) {
    return false;
  }

  const time = timeLib.getTimeFromDayjs(dateTime);

  return timeLib.isBetween(time, { minTime: validTimeFrom, maxTime: validTimeTo }, '[)');
};

export const isInBreakTime = (dateTime, { breakTimeFrom, breakTimeTo }) => {
  if (!timeLib.isValidTime(breakTimeFrom) || !timeLib.isValidTime(breakTimeTo)) {
    return false;
  }

  const time = timeLib.getTimeFromDayjs(dateTime);

  return timeLib.isBetween(time, { minTime: breakTimeFrom, maxTime: breakTimeTo }, '[)');
};

export const isInVacations = (dateTime, vacations) => {
  if (!vacations) {
    return false;
  }

  const formatDate = dateTime.format('YYYY/MM/DD');

  const inVacation = vacations.some(({ vacationTimeFrom, vacationTimeTo }) => {
    return formatDate >= vacationTimeFrom && formatDate <= vacationTimeTo;
  });

  return inVacation;
};
