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

  if (!_isEmpty(value) && rules.pattern) {
    validationRules.pattern = {
      ...formRules.pattern,
      pattern: rules.pattern,
    };
  }

  return validateField(fieldName, value, validationRules, customMessages);
};

const InputText = ({
  containerClassName,
  label,
  disabled,
  ready,
  className,
  style,
  name,
  maxlength,
  minlength,
  value,
  messages,
  rules,
  onChange,
  onBlur,
  onValidation,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { required, pattern } = rules;
  const handleChangeText = useCallback(
    currentValue => {
      const currentErrorMessage = getErrorMessage(label, currentValue, { required, pattern }, messages);

      if (!currentErrorMessage) {
        setErrorMessage(currentErrorMessage);
        onValidation && onValidation({ name, errorMessage: currentErrorMessage });
      }

      onChange && onChange(currentValue);
    },
    [onChange, onValidation, name, label, messages, pattern, required]
  );
  const handleBlurInputText = useCallback(
    currentValue => {
      const currentErrorMessage = getErrorMessage(label, currentValue, { required, pattern }, messages);

      setErrorMessage(currentErrorMessage);
      onValidation && onValidation({ name, errorMessage: currentErrorMessage });
      onBlur && onBlur(currentValue);
    },
    [onBlur, onValidation, name, label, messages, pattern, required]
  );

  return (
    <div className={styles.InputValidationContainer}>
      <Input
        containerClassName={containerClassName}
        label={label}
        required={required}
        isInvalid={!!errorMessage}
        disabled={disabled}
        ready={ready}
        className={className}
        style={style}
        type="text"
        maxlength={maxlength}
        minlength={minlength}
        name={name}
        value={value}
        onChangeValue={handleChangeText}
        onBlurValue={handleBlurInputText}
      />
      <span className={styles.InputValidationErrorMessage}>{errorMessage}</span>
    </div>
  );
};

InputText.displayName = 'InputText';

InputText.propTypes = {
  containerClassName: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  ready: PropTypes.bool,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  name: PropTypes.string,
  maxlength: PropTypes.number,
  minlength: PropTypes.number,
  value: PropTypes.string,
  messages: PropTypes.shape({
    required: PropTypes.string,
    pattern: PropTypes.string,
  }),
  rules: PropTypes.shape({
    required: PropTypes.bool,
    pattern: PropTypes.instanceOf(RegExp),
  }),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onValidation: PropTypes.func,
};

InputText.defaultProps = {
  containerClassName: null,
  label: 'Text',
  disabled: false,
  ready: true,
  className: null,
  style: null,
  name: null,
  maxlength: undefined,
  minlength: 0,
  value: '',
  messages: {
    required: null,
    pattern: null,
  },
  rules: {
    required: false,
    pattern: null,
  },
  onChange: () => {},
  onBlur: () => {},
  onValidation: () => {},
};

export default InputText;
