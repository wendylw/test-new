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
import { getClassName } from '../../../utils/ui';
import { COUNTRIES } from '../../../common/utils/constants';
import styles from './PhoneNumberInput.module.scss';

const PhoneNumberInput = ({ className, placeholder, country, phone, onFocus, onBlur, onChange, onCountryChange }) => {
  const { t } = useTranslation();
  const phoneNumberInputRef = useRef(null);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [currentCountry, setCurrentCountry] = useState(country);
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

  return (
    <PhoneInput
      ref={phoneNumberInputRef}
      data-test-id="common.phone-number-input"
      // If input want to show country code when phone number is empty, pls add international on props
      international
      addInternationalOption={false}
      smartCaret={false}
      placeholder={placeholder || t('EnterPhoneNumber')}
      className={getClassName([styles.PhoneNumberInput, className])}
      value={formatPhoneNumberIntl(currentPhone)}
      defaultCountry={currentCountry}
      country={currentCountry}
      countries={Object.keys(COUNTRIES)}
      onChange={handleChangePhoneNumber}
      onCountryChange={handleChangeCountry}
      onBlur={handleBlurPhoneNumberInput}
      onFocus={handleFocusPhoneNumberInput}
    />
  );
};

PhoneNumberInput.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  phone: PropTypes.string,
  country: PropTypes.string,
  onChange: PropTypes.func,
  onCountryChange: PropTypes.func,
  onError: PropTypes.func,
};

PhoneNumberInput.defaultProps = {
  className: null,
  placeholder: null,
  phone: '',
  country: 'MY',
  onChange: () => {},
  onCountryChange: () => {},
  onError: () => {},
};
PhoneNumberInput.displayName = 'PhoneNumberInput';

export default PhoneNumberInput;
