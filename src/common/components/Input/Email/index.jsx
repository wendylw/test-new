/* eslint-disable */
import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { formRules, validateField } from '../utils';
import Input from '../Input';
import styles from '../InputValidation.module.scss';

const getErrorMessage = (fieldName, value, rules, customMessages) => {
  const validationRules = {};

  if (rules.required) {
    validationRules.required = formRules.required;
  }

  if (!_isEmpty(value)) {
    validationRules.email = formRules.email;
  }

  return validateField(fieldName, value, validationRules, customMessages);
};

const InputEmail = ({
  containerClassName,
  label,
  disabled,
  ready,
  className,
  style,
  name,
  value,
  messages,
  rules,
  onChange,
  onBlur,
  onValidation,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { required } = rules;
  const handleChangeEmail = useCallback(
    currentValue => {
      const errorMessage = getErrorMessage(label, currentValue, { required }, messages);

      if (!errorMessage) {
        setErrorMessage(errorMessage);
        onValidation && onValidation({ name, errorMessage });
      }

      onChange && onChange(currentValue);
    },
    [onChange, onValidation, name, label, messages, required]
  );
  const handleBlurInputEmail = useCallback(
    currentValue => {
      const errorMessage = getErrorMessage(label, currentValue, { required }, messages);

      setErrorMessage(errorMessage);
      onValidation && onValidation({ name, errorMessage });
      onBlur && onBlur(currentValue);
    },
    [onBlur, onValidation, name, label, required, messages, required]
  );

  return (
    <div className={styles.InputValidationContainer}>
      <Input
        containerClassName={containerClassName}
        label={label}
        required={required}
        isInvalid={!!errorMessage}
        ready={ready}
        disabled={disabled}
        className={className}
        style={style}
        type="text"
        name={name}
        value={value}
        onChangeValue={handleChangeEmail}
        onBlurValue={handleBlurInputEmail}
      />
      <span className={styles.InputValidationErrorMessage}>{errorMessage}</span>
    </div>
  );
};

InputEmail.displayName = 'InputEmail';

InputEmail.propTypes = {
  containerClassName: PropTypes.string,
  label: PropTypes.string,
  ready: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  name: PropTypes.string,
  value: PropTypes.string,
  messages: PropTypes.shape({
    required: PropTypes.string,
  }),
  rules: PropTypes.shape({
    required: PropTypes.bool,
  }),
  onChange: PropTypes.func,
  onValidation: PropTypes.func,
};

InputEmail.defaultProps = {
  containerClassName: null,
  label: 'Email',
  ready: true,
  disabled: false,
  className: null,
  style: null,
  name: null,
  value: '',
  messages: {
    required: null,
  },
  rules: {
    required: false,
  },
  onChange: () => {},
  onValidation: () => {},
};

export default InputEmail;
