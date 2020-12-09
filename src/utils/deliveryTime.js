export const checkEnablePlaceOnDemandOrder = () => {};

export const isAvailableOrderTime = (
  time,
  { validDays, validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo, vacations }
) => {
  return (
    isInValidDays(time, validDays) &&
    isInValidTime(time, { validTimeFrom, validTimeTo }) &&
    !isInBreakTime(time, { breakTimeFrom, breakTimeTo }) &&
    !isInVacations(time, vacations)
  );
};

const isInValidDays = (time, validDays) => {
  return true;
};

const isInValidTime = (time, { validTimeFrom, validTimeTo }) => {
  return true;
};

const isInBreakTime = (time, { breakTimeFrom, breakTimeTo }) => {
  return true;
};

const isInVacations = (time, vacations) => {
  return true;
};
