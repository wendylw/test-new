export const checkBirthdayIsValid = birthday => {
  const getBirthday = birthday.split('/');
  const birthdayTemporary = `2021/${getBirthday[1]}/${getBirthday[0]}`;
  const birthDayComplete = birthdayTemporary.split('/');
  if (birthdayTemporary === '') return false;
  const d = new Date(birthdayTemporary);
  if (Number.isNaN(d)) return false;
  return (
    parseInt(birthDayComplete[0], 10) === d.getFullYear() &&
    parseInt(birthDayComplete[2], 10) === d.getDate() &&
    parseInt(birthDayComplete[1], 10) === d.getMonth() + 1
  );
};

export const convertToBackEndFormat = inputDate => {
  const [birthdayDay, birthdayMonth] = inputDate.split('/');
  const birthdayYear = '2020';
  const date = new Date();
  date.setDate(birthdayDay);
  date.setMonth(birthdayMonth - 1);
  date.setFullYear(birthdayYear);
  const res = date.toISOString();
  return res;
};
