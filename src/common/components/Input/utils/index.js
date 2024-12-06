import i18next from 'i18next';
import _isEmpty from 'lodash/isEmpty';
import dayjs from 'dayjs';
import { isValidDate } from '../../../../utils/datetime-lib';

const getMatchedBirthdayGroups = birthday => {
  const [year, month, day] = birthday.split('-').map(Number);

  return { year, month, day };
};

const isValidBirthdayDateString = birthday => {
  const regex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const isValidDateFormat = regex.test(birthday);

  if (!isValidDateFormat) {
    return false;
  }

  const matchedBirthdayGroups = getMatchedBirthdayGroups(birthday);
  const { day, month, year } = matchedBirthdayGroups;
  const internalBirthdayDate = `${year}/${month}/${day}`;

  return isValidDate(new Date(internalBirthdayDate));
};

const isAfterTodayBirthdayDate = birthday => {
  const matchedBirthdayGroups = getMatchedBirthdayGroups(birthday);

  const { day, month, year } = matchedBirthdayGroups;

  return dayjs(`${year}-${month}-${day}`).isAfter(dayjs());
};

const isTooOldBirthdayDate = birthday => {
  const matchedBirthdayGroups = getMatchedBirthdayGroups(birthday);

  // get 120 years ago date, current people can not older this date.
  const date120YearsAgo = dayjs().subtract(120, 'year');

  const { day, month, year } = matchedBirthdayGroups;

  return dayjs(`${year}-${month}-${day}`).isBefore(date120YearsAgo);
};

export const formRules = {
  // Required field validation
  required: {
    validator: value => !_isEmpty(value),
    message: (fieldName, customMessage) => customMessage || i18next.t('Common:ErrorInputRequired', { fieldName }),
  },
  // Email pattern validation
  email: {
    validator: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: (_, customMessage) => customMessage || i18next.t('Common:ErrorEmailPattern'),
  },
  // Pattern validation
  pattern: {
    validator: (value, pattern) => {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return false;
      }

      return true;
    },
    message: (fieldName, customMessage) => customMessage || i18next.t('Common:ErrorInputPattern', { fieldName }),
  },
  // Phone Input validation
  phone: {
    message: (fieldName, customMessage) => customMessage || i18next.t('Common:ErrorInputPattern', { fieldName }),
  },
  // birthday Input validation
  birthday: {
    errorType: null,
    validator: value => {
      if (!isValidBirthdayDateString(value)) {
        formRules.birthday.errorType = 'invalidFormat'; // invalid date string
        return false;
      }

      if (isAfterTodayBirthdayDate(value)) {
        formRules.birthday.errorType = 'futureDate'; // date can not after today
        return false;
      }
      if (isTooOldBirthdayDate(value)) {
        formRules.birthday.errorType = 'tooOld'; // date is too early than 120 years
        return false;
      }

      formRules.birthday.errorType = null;

      return true;
    },
    message: (fieldName, customMessage) => {
      if (customMessage) {
        return customMessage;
      }

      // according to errorType return error message
      switch (formRules.birthday.errorType) {
        case 'invalidFormat':
          return i18next.t('Common:ErrorNotValidBirthday');
        case 'futureDate':
          return i18next.t('Common:ErrorBirthdayLaterThanToday');
        case 'tooOld':
          return i18next.t('Common:ErrorBirthdayTooOld', { fieldName });
        default:
          return i18next.t('Common:ErrorInputPattern', { fieldName });
      }
    },
  },
};

export const validateField = (fieldName, value, rules, customMessages) => {
  let customMessage = null;
  const ruleKeys = Object.keys(rules);
  const invalidRuleKey = ruleKeys.find(key => {
    const rule = rules[key];
    const { validator, pattern } = rule || {};
    const isValid = !pattern ? validator(value) : validator(value, pattern);

    if (!isValid) {
      customMessage = customMessages[key];

      return true;
    }

    return false;
  });

  if (!invalidRuleKey || !rules[invalidRuleKey]) {
    return null;
  }

  return rules[invalidRuleKey].message(fieldName, customMessage);
};
