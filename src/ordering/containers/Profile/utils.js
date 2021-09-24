import { isValidDate } from '../../../utils/datetime-lib';

export const checkBirthdayIsValid = birthday => {
  try {
    const matchedDate = birthday.match(/^(\d{1,2})(\/)(\d{1,2})$/);
    if (!matchedDate) {
      return false;
    }
    // Warning: Before, DUE to some reasons, PO decided to fix the year of use to 2020, which is consistent with app
    const completeBirthday = `2020/${matchedDate[3]}/${matchedDate[1]}`;
    const splittedCompleteBirthday = completeBirthday.split('/');
    const date = new Date(completeBirthday);
    if (!isValidDate(date)) return false;
    return (
      parseInt(splittedCompleteBirthday[0], 10) === date.getFullYear() &&
      parseInt(splittedCompleteBirthday[1], 10) === date.getMonth() + 1 &&
      parseInt(splittedCompleteBirthday[2], 10) === date.getDate()
    );
  } catch (error) {
    return false;
  }
};

export const convertToBackEndFormat = inputDate => {
  const [birthdayDay, birthdayMonth] = inputDate.split('/');
  // Warning: Before, DUE to some reasons, PO decided to fix the year of use to 2020, which is consistent with app
  const birthdayYear = '2020';
  const date = new Date();
  date.setDate(birthdayDay);
  date.setMonth(birthdayMonth - 1);
  date.setFullYear(birthdayYear);
  return date.toISOString();
};
