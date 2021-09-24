import { isValidDate } from '../../../utils/datetime-lib';

export const checkBirthdayIsValid = birthday => {
  try {
    const matchedDate = birthday.match(/^(\d{2})(\/)(\d{2})$/);
    if (!matchedDate) {
      return false;
    }
    const birthdayCom = `2020/${matchedDate[3]}/${matchedDate[1]}`;
    const birthdayComP = birthdayCom.split('/');
    const date = new Date(birthdayCom);
    if (!isValidDate(date)) return false;
    return (
      parseInt(birthdayComP[0], 10) === date.getFullYear() &&
      parseInt(birthdayComP[1], 10) === date.getMonth() + 1 &&
      parseInt(birthdayComP[2], 10) === date.getDate()
    );
  } catch (error) {
    return false;
  }
};

export const convertToBackEndFormat = inputDate => {
  const [birthdayDay, birthdayMonth] = inputDate.split('/');
  const birthdayYear = '2020';
  const date = new Date();
  date.setDate(birthdayDay);
  date.setMonth(birthdayMonth - 1);
  date.setFullYear(birthdayYear);
  return date.toISOString();
};
