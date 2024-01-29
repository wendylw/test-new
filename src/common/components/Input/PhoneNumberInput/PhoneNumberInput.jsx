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
import { ERROR_TYPES, PHONE_NUMBER_INPUT_STATUS } from './constants';
import styles from './PhoneNumberInput.module.scss';

const PhoneNumberInput = ({
  className,
  placeholder,
  country,
  phone,
  onFocus,
  onBlur,
  onChange,
  onCountryChange,
  onError,
}) => {
  const { t } = useTranslation();
  const phoneNumberInputRef = useRef(null);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [currentCountry, setCurrentCountry] = useState(country);
  const handleChangePhoneNumber = changedPhone => {
    if (!Boolean(changedPhone)) {
      onChange({ phone: changedPhone, status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE });

      return;
    }

    const { number } = parsePhoneNumber(changedPhone) || {};

    onChange({ phone: number, status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE });
  };
  const handleChangeCountry = changedCountry => {
    if (changedCountry && changedCountry !== country) {
      onChange({ phone: '', status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE_COUNTRY });
      onCountryChange({ country: updatedCountry, status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE_COUNTRY });
    }
  };
  const handleBlurPhoneNumberInput = event => {
    handleChangePhoneNumber(event.target.value);
    handleChangeCountry(country);
  };
  const handleFocusPhoneNumberInput = event => {
    onFocus({ phone: currentPhone, status: PHONE_NUMBER_INPUT_STATUS.ON_FOCUS });
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
      defaultCountry={currentPhone}
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
