import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getClassName } from '../../utils/ui';
import styles from './Input.module.scss';

const Input = ({
  containerClassName,
  label,
  disabled,
  ready,
  required,
  pattern,
  maxlength,
  minlength,
  readOnly,
  isInvalid,
  placeholder,
  className,
  style,
  type,
  name,
  value,
  onChangeValue,
  onBlurValue,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const handleChange = useCallback(
    e => {
      setInputValue(e.target.value);
      onChangeValue(e.target.value);
    },
    [onChangeValue]
  );
  const handleBlur = useCallback(
    e => {
      onBlurValue(e.target.value);
    },
    [onBlurValue]
  );

  useEffect(() => {
    if (ready && value) {
      setInputValue(value);
    }
  }, [value, ready]);

  return (
    <div
      className={getClassName([
        styles.InputContainer,
        disabled ? styles.InputContainerDisabled : null,
        isInvalid ? styles.InputContainerError : null,
        containerClassName,
      ])}
    >
      <label className={styles.InputLabel} htmlFor={name}>
        <span className={styles.InputLabelText}>{label}</span>
        {required && <sup className={styles.InputLabelRequiredIcon}>*</sup>}
      </label>
      <input
        className={getClassName([styles.Input, isInvalid ? styles.InputError : null, className])}
        style={style}
        placeholder={placeholder}
        type={type}
        required={required}
        pattern={pattern}
        value={inputValue}
        name={name}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        data-test-id="common.input.text"
        minLength={minlength}
        maxLength={maxlength}
        readOnly={readOnly}
      />
    </div>
  );
};

Input.displayName = 'Input';

Input.propTypes = {
  containerClassName: PropTypes.string,
  label: PropTypes.string,
  ready: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  pattern: PropTypes.string,
  maxlength: PropTypes.number,
  minlength: PropTypes.number,
  readOnly: PropTypes.bool,
  isInvalid: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  type: PropTypes.oneOf(['text', 'email']),
  name: PropTypes.string,
  value: PropTypes.string,
  onChangeValue: PropTypes.func,
  onBlurValue: PropTypes.func,
};

Input.defaultProps = {
  containerClassName: null,
  label: '',
  ready: true,
  disabled: false,
  required: false,
  pattern: null,
  maxlength: undefined,
  minlength: 0,
  readOnly: false,
  isInvalid: false,
  placeholder: '',
  className: null,
  style: null,
  type: 'text',
  name: null,
  value: '',
  onChangeValue: () => {},
  onBlurValue: () => {},
};

export default Input;
