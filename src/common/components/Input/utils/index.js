import _isEmpty from 'lodash/isEmpty';
import i18next from 'i18next';

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
