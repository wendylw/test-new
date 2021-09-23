/* eslint-disable camelcase */
export const checkBirthdayIsValid = birthday => {
  const reg = birthday.match(/^(\d{2})(\/)(\d{2})$/);
  const day = Number(reg[1]);
  const month = Number(reg[3]);
  if (reg == null || day > 31 || month > 12 || day < 1 || month < 1) {
    return false;
  }
  return true;
};

export const ConvertToBackEndFormat = inputDate => {
  const [birthday_day, birthday_month] = inputDate.split('/');
  const birthday_year = '2020';
  const date = new Date();
  date.setDate(birthday_day);
  date.setMonth(birthday_month - 1);
  date.setFullYear(birthday_year);
  const res = date.toISOString();
  return res;
};
