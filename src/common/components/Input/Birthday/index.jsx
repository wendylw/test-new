import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { getClassName } from '../../../utils/ui';
import { BIRTHDAY_DATE } from './utils/constants';
import { formRules, validateField } from '../utils';
import {
  getFormatBirthdayData,
  getSwitchFormatBirthdayDate,
  getBirthdayDateISODate,
  getIsSupportedShowPicker,
  getIsDateInputOnUpperLayer,
} from './utils';
import logger from '../../../../utils/monitoring/logger';
import Input from '../Input';
import styles from '../InputValidation.module.scss';
import birthdayStyles from './Birthday.module.scss';

const getErrorMessage = (fieldName, value, rules, customMessages) => {
  const validationRules = {};

  if (rules.required) {
    validationRules.required = formRules.required;
  }

  if (!_isEmpty(value)) {
    validationRules.birthday = formRules.birthday;
  }

  return validateField(fieldName, value, validationRules, customMessages);
};

const InputBirthday = ({
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
  const isDateInputOnUpperLayer = getIsDateInputOnUpperLayer();
  const { t } = useTranslation();
  const birthdayInputRef = useRef(null);
  const [isSupportedShowPicker, setIsSupportedShowPicker] = useState(getIsSupportedShowPicker());
  const [errorMessage, setErrorMessage] = useState();
  const { required, pattern } = rules;
  const handleChangeInputBirthday = useCallback(
    currentValue => {
      const currentErrorMessage = getErrorMessage(label, currentValue, { required, pattern }, messages);

      if (!currentErrorMessage) {
        setErrorMessage(currentErrorMessage);
        onValidation && onValidation({ name, errorMessage: currentErrorMessage });
      }

      onChange && onChange(getBirthdayDateISODate(currentValue));
    },
    [onChange, onValidation, name, label, messages, pattern, required]
  );
  const handleBlurInputBirthday = useCallback(
    currentValue => {
      const currentErrorMessage = getErrorMessage(label, currentValue, { required, pattern }, messages);

      setErrorMessage(currentErrorMessage);
      onValidation && onValidation({ name, errorMessage: currentErrorMessage });
      onBlur && onBlur(getBirthdayDateISODate(currentValue));
    },
    [onBlur, onValidation, name, label, messages, pattern, required]
  );
  const handleChangeBirthday = useCallback(
    event => {
      handleChangeInputBirthday(event.target.value);
    },
    [handleChangeInputBirthday]
  );
  const handleOpenBirthdayPicker = useCallback(
    event => {
      if (!isSupportedShowPicker) {
        return;
      }

      try {
        event.preventDefault();
        event.stopPropagation();

        // only input date supported will call showPicker
        birthdayInputRef.current.showPicker();
      } catch (error) {
        setIsSupportedShowPicker(false);

        logger.error('Common_InputBirthDay_ShowPickerFailed', { message: error?.message });
      }
    },
    [isSupportedShowPicker]
  );
  // If initialization birthday picker is empty, this method can catch required error
  const handleInvalidBirthdayPicker = event => {
    event.preventDefault();

    const currentErrorMessage = getErrorMessage(label, event.target.value, { required, pattern }, messages);

    setErrorMessage(currentErrorMessage);
    onValidation && onValidation({ name, errorMessage: currentErrorMessage });
  };

  return (
    <div
      className={getClassName([styles.InputValidationContainer, birthdayStyles.BirthdayInputContainer])}
      aria-hidden
      data-test-id="common.profile.birthday-date-picker-container"
      onClick={handleOpenBirthdayPicker}
    >
      {isSupportedShowPicker && (
        <input
          ref={birthdayInputRef}
          // Customer clicked input text to show date picker, so need to up date z-index can be touch on layout top
          className={getClassName([
            birthdayStyles.BirthdayInputDatePicker,
            isDateInputOnUpperLayer ? birthdayStyles.BirthdayInputDatePickerUpperLayer : null,
          ])}
          name="birthday"
          type="date"
          min={BIRTHDAY_DATE.MIN}
          max={BIRTHDAY_DATE.MAX}
          data-test-id="common.profile.birthday-date-picker"
          required={required}
          disabled={disabled}
          value={value}
          onChange={handleChangeBirthday}
          onInvalid={handleInvalidBirthdayPicker}
        />
      )}
      <Input
        data-test-id="common.profile.birthday-date-input"
        containerClassName={getClassName([containerClassName, birthdayStyles.BirthdayInput])}
        label={label}
        required={required}
        isInvalid={!!errorMessage}
        disabled={disabled}
        readOnly={isSupportedShowPicker}
        ready={ready}
        className={className}
        style={style}
        placeholder={t('BirthdayInputPlaceholder')}
        type="text"
        maxlength={10}
        minlength={0}
        name={name}
        value={getFormatBirthdayData(value)}
        onChangeValue={changeValue => {
          // If isSupportedShowPicker is true, only need date picker change birth date value
          !isSupportedShowPicker && handleChangeInputBirthday(getSwitchFormatBirthdayDate(changeValue));
        }}
        onBlurValue={blurValue => {
          // If isSupportedShowPicker is true, only need date picker change birth date value
          !isSupportedShowPicker && handleBlurInputBirthday(getSwitchFormatBirthdayDate(blurValue));
        }}
      />
      <span className={styles.InputValidationErrorMessage}>{errorMessage}</span>
    </div>
  );
};

InputBirthday.displayName = 'InputBirthday';

InputBirthday.propTypes = {
  containerClassName: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  ready: PropTypes.bool,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  name: PropTypes.string,
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

InputBirthday.defaultProps = {
  containerClassName: null,
  label: i18next.t('Common:DateOfBirth'),
  disabled: false,
  ready: true,
  className: null,
  style: null,
  name: null,
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

export default InputBirthday;
