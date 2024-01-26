import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
// The sub-package 'react-phone-number-input/mobile' has already used 'libphonenumber-js/metadata.mobile.json'
// when building Input, so it needs to be referenced repeatedly
// TODO: generate customize metadata for mobile,
//   https://gitlab.com/catamphetamine/libphonenumber-metadata-generator
//   https://www.npmjs.com/package/libphonenumber-js#customizing-metadata
import PhoneInput, {
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  parsePhoneNumber,
} from 'react-phone-number-input/mobile';
import 'react-phone-number-input/style.css';
import { VALIDATION_COUNTRIES } from '../../../utils/phone-number-constants';
import styles from './PhoneNumberInput.module.scss';

const PhoneNumberInput = ({
  className,
  label,
  labelAlignInside,
  labelClassName,
  placeholder,
  error,
  country,
  phone,
  onChange,
  onCountryChange,
  onError,
}) => {
  const { t } = useTranslation();
  const phoneNumberInputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [currentCountry, setCurrentCountry] = useState(country);
  const [currentError, setError] = useState(null);
  const labelContent = label ? (
    <div
      className={`${styles.PhoneNumberInputLabel} ${
        labelAlignInside ? styles.PhoneNumberInputInsideLabel : ''
      } ${labelClassName}`}
    >
      {label}
    </div>
  ) : null;
  const updateError = useCallback(
    newError => {
      setError(newError);
      onError({ error: newError });
    },
    [onError]
  );
  const handleChangePhoneNumber = updatedPhone => {
    let number = '';

    if (updatedPhone) {
      number = parsePhoneNumber(updatedPhone)?.number ? parsePhoneNumber(updatedPhone).number : updatedPhone;
    }

    setCurrentPhone(number);
    onChange({ phone: number });
  };
  const handleChangeCountry = updatedCountry => {
    setCurrentCountry(updatedCountry);
    onCountryChange({ country: updatedCountry });
  };
  const handleFocusPhoneNumberInput = useCallback(() => {
    setProcessing(true);
  }, [setProcessing]);
  const handleBlurPhoneNumberInput = event => {
    setProcessing(false);
    handleChangePhoneNumber(event.target.value);
    handleChangeCountry(currentCountry);
  };

  useMount(() => {
    setTimeout(() => {
      phoneNumberInputRef.current?.focus();
    });
  });

  useEffect(() => {
    setCurrentPhone(phone);
  }, [phone]);

  useEffect(() => {
    setCurrentCountry(country);
  }, [country]);

  useEffect(() => {
    if (error) {
      updateError(error);
    } else if (currentPhone && isValidPhoneNumber(currentPhone)) {
      updateError(null);
    } else if (!processing && (!currentCountry || !VALIDATION_COUNTRIES.includes(currentCountry))) {
      updateError(t('CountryIsNotSupported'));
    } else if (!processing && currentPhone && !isValidPhoneNumber(currentPhone)) {
      updateError(t('PleaseEnterValidPhoneNumber'));
    }
  }, [currentPhone, currentCountry, error, processing, t, updateError]);

  return (
    <div className={styles.PhoneNumberFormItemContainer}>
      {!labelAlignInside && labelContent}
      <div
        className={`${styles.PhoneNumberInputContainer} ${
          currentError ? styles.PhoneNumberInputContainer__error : ''
        } ${className}`}
      >
        {labelAlignInside && labelContent}
        <PhoneInput
          ref={phoneNumberInputRef}
          data-test-id="common.phone-number-input"
          // If input want to show country code when phone number is empty, pls add international on props
          international
          addInternationalOption={false}
          smartCaret={false}
          placeholder={placeholder || t('EnterPhoneNumber')}
          className={`${styles.PhoneNumberInput} ${currentError ? styles.PhoneNumberInput__error : ''}  ${
            labelAlignInside ? styles.PhoneNumberInsideLabelInput : ''
          }`}
          value={formatPhoneNumberIntl(currentPhone)}
          defaultCountry={currentCountry}
          country={currentCountry}
          countries={VALIDATION_COUNTRIES}
          onChange={handleChangePhoneNumber}
          onCountryChange={handleChangeCountry}
          onBlur={handleBlurPhoneNumberInput}
          onFocus={handleFocusPhoneNumberInput}
        />
      </div>
      {currentError ? <p className={styles.PhoneNumberInputErrorMessage}>{currentError}</p> : null}
    </div>
  );
};

PhoneNumberInput.propTypes = {
  className: PropTypes.string,
  label: PropTypes.node,
  labelAlignInside: PropTypes.bool,
  labelClassName: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  phone: PropTypes.string,
  country: PropTypes.string,
  onChange: PropTypes.func,
  onCountryChange: PropTypes.func,
  onError: PropTypes.func,
};

PhoneNumberInput.defaultProps = {
  className: null,
  label: null,
  labelAlignInside: false,
  labelClassName: null,
  placeholder: null,
  error: null,
  phone: '',
  country: 'MY',
  onChange: () => {},
  onCountryChange: () => {},
  onError: () => {},
};
PhoneNumberInput.displayName = 'PhoneNumberInput';

export default PhoneNumberInput;
