/* eslint-disable */
import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { formRules, validateField } from '../utils';
import PhoneNumber from './PhoneNumber';
import styles from './PhoneNumberLabelInside.module.scss';

const getErrorMessage = (fieldName, value, rules, customMessages, isValidPhone) => {
  const validationRules = {};

  if (rules.required) {
    validationRules.required = formRules.required;
  }

  const errorMessage = validateField(fieldName, value, validationRules, customMessages);

  if (errorMessage) {
    return errorMessage;
  }

  if (!isValidPhone) {
    return formRules.phone.message(fieldName, customMessages.valid);
  }

  return null;
};
const PhoneNumberLabelInside = ({
  label,
  messages,
  rules,
  className,
  placeholder,
  countries,
  ready,
  name,
  defaultCountry,
  defaultPhone,
  onChange,
  onChangeCountry,
  onBlur,
  onValidation,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { required } = rules;
  const handleChangePhoneNumber = useCallback(
    currentPhone => {
      const errorMessage = getErrorMessage(label, currentPhone, { required }, messages, true);

      if (!errorMessage) {
        setErrorMessage(errorMessage);
        onValidation && onValidation({ name, errorMessage });
      }

      onChange && onChange({ phone: currentPhone });
    },
    [onChange, onValidation, name, label, messages, required]
  );
  const handleChangeCountry = useCallback(
    currentCountry => {
      onChangeCountry && onChangeCountry(currentCountry);
    },
    [onChangeCountry]
  );
  const handleBlurPhoneInput = useCallback(
    ({ phone: currentPhone, country: currentCountry, invalid }) => {
      const errorMessage = getErrorMessage(label, currentPhone, required, messages, !invalid);

      setErrorMessage(errorMessage);
      onValidation && onValidation({ name, errorMessage });
      onBlur &&
        onBlur({
          phone: currentPhone,
          country: currentCountry,
          invalid,
        });
    },
    [onBlur, onValidation, name, label, messages, required]
  );

  return (
    <div className={styles.PhoneNumberLabelInsideContainer}>
      <div className={styles.PhoneNumberLabelInsideInputContainer}>
        <label className={styles.PhoneNumberLabelInsideLabel} htmlFor={name}>
          <span className={styles.PhoneNumberLabelInsideLabelText}>{label}</span>
          {required && <sup className={styles.PhoneNumberLabelInsideLabelRequiredIcon}>*</sup>}
        </label>
        <PhoneNumber
          className={className}
          placeholder={placeholder}
          countries={countries}
          ready={ready}
          name={name}
          defaultCountry={defaultCountry}
          defaultPhone={defaultPhone}
          onChangePhoneNumber={handleChangePhoneNumber}
          onChangeCountry={handleChangeCountry}
          onBlurPhoneInput={handleBlurPhoneInput}
        />
      </div>
      <span className={styles.PhoneNumberLabelInsideErrorMessage}>{errorMessage}</span>
    </div>
  );
};

PhoneNumberLabelInside.displayName = 'PhoneNumberLabelInside';

PhoneNumberLabelInside.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  ready: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string,
  defaultCountry: PropTypes.string,
  defaultPhone: PropTypes.string,
  messages: PropTypes.shape({
    required: PropTypes.string,
    phone: PropTypes.string,
  }),
  rules: PropTypes.shape({
    required: PropTypes.bool,
  }),
  onChange: PropTypes.func,
  onChangeCountry: PropTypes.func,
  onBlur: PropTypes.func,
  onValidation: PropTypes.func,
};

PhoneNumberLabelInside.defaultProps = {
  label: 'Mobile Number',
  disabled: false,
  ready: true,
  className: null,
  style: null,
  name: null,
  defaultCountry: '',
  defaultPhone: '',
  messages: {
    required: null,
  },
  rules: {
    required: false,
  },
  onChange: () => {},
  onChangeCountry: () => {},
  onBlur: () => {},
  onValidation: () => {},
};

export default PhoneNumberLabelInside;
