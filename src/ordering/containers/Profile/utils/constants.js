import dayjs from 'dayjs';

export const PROFILE_FIELD_ERROR_TYPES = {
  REQUIRED: 'required',
  UNAVAILABLE: 'unavailable',
  DUPLICATED: 'duplicated',
  OUT_OF_DATE: 'outOfDate',
};

export const ERROR_TRANSLATION_KEYS = {
  [PROFILE_FIELD_ERROR_TYPES.REQUIRED]: {
    firstName: 'FirstNameIsRequired',
    email: 'EmailIsRequired',
    birthday: 'BirthdayIsRequired',
  },
  [PROFILE_FIELD_ERROR_TYPES.UNAVAILABLE]: {
    email: 'NotValidEmail',
    birthday: 'NotValidBirthday',
  },
  [PROFILE_FIELD_ERROR_TYPES.DUPLICATED]: {
    email: 'DuplicatedEmail',
  },
  [PROFILE_FIELD_ERROR_TYPES.OUT_OF_DATE]: {
    birthday: 'BirthdayCanNotLaterThanToday',
  },
};

// If customer click don't ask again button, profile will hide 10 years
export const PROFILE_SKIP_CYCLE = 3650;

export const PROFILE_BIRTHDAY_FORMAT = 'DD/MM/YYYY';

export const BIRTHDAY_DATE = {
  MIN: '1900-01-01',
  MAX: dayjs().format('YYYY-MM-DD'),
};
