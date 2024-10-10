import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { getClassName } from '../../../utils/ui';
import { SYSTEM_DEFAULT_COUNTRY } from '../../../utils/phone-number-constants';
import 'react-phone-number-input/style.css';
import styles from './InputPhoneNumber.module.scss';

const getIsValidPhoneNumber = phoneNumber => {
  try {
    return isValidPhoneNumber(phoneNumber);
  } catch (error) {
    return false;
  }
};
const InputPhoneNumber = ({
  className,
  placeholder,
  countries,
  ready,
  name,
  defaultCountry,
  defaultPhone,
  onChangePhoneNumber,
  onChangeCountry,
  onBlurPhoneInput,
}) => {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(SYSTEM_DEFAULT_COUNTRY);
  const [invalid, setInvalid] = useState(false);
  const handleChangePhoneNumber = useCallback(
    targetPhone => {
      const changePhone = targetPhone || '';
      setPhone(changePhone);
      onChangePhoneNumber(changePhone);
    },
    [onChangePhoneNumber]
  );
  const handleChangeCountry = useCallback(
    targetCountry => {
      setCountry(targetCountry || '');
      onChangeCountry(targetCountry || '');
    },
    [onChangeCountry]
  );
  const handleBlurPhoneInput = useCallback(() => {
    const isValidPhone = getIsValidPhoneNumber(phone);

    setInvalid(!isValidPhone);
    onBlurPhoneInput({ phone, country, invalid: !isValidPhone });
  }, [phone, country, onBlurPhoneInput]);

  useEffect(() => {
    if (ready) {
      try {
        !_isEmpty(defaultCountry) && setCountry(defaultCountry);
        setInvalid(invalid);

        if (!_isEmpty(defaultPhone)) {
          setPhone(defaultPhone);
          setInvalid(!getIsValidPhoneNumber(defaultPhone));
        }
      } catch (error) {
        setInvalid(true);
      }
    }
  }, [ready, defaultPhone, defaultCountry, invalid]);

  return (
    <PhoneInput
      className={getClassName([styles.InputPhoneNumber, className, invalid ? styles.InputPhoneNumberError : null])}
      international
      name={name}
      data-test-id="eInvoice.input.phone-number"
      smartCaret={false}
      placeholder={placeholder}
      countries={countries}
      defaultCountry={defaultCountry}
      country={country}
      value={phone}
      onChange={handleChangePhoneNumber}
      onCountryChange={handleChangeCountry}
      onBlur={handleBlurPhoneInput}
    />
  );
};

InputPhoneNumber.displayName = 'InputPhoneNumber';

InputPhoneNumber.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  ready: PropTypes.bool,
  name: PropTypes.string,
  defaultCountry: PropTypes.string,
  // only accept ISO 3166-1 alpha-2 code list: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
  // If business reference, it can use /utils/phone-number-constants.js
  countries: PropTypes.arrayOf(PropTypes.string),
  defaultPhone: PropTypes.string,
  onChangePhoneNumber: PropTypes.func,
  onChangeCountry: PropTypes.func,
  onBlurPhoneInput: PropTypes.func,
};

InputPhoneNumber.defaultProps = {
  className: null,
  placeholder: null,
  ready: true,
  name: 'phone',
  defaultCountry: SYSTEM_DEFAULT_COUNTRY,
  countries: null,
  defaultPhone: '',
  onChangePhoneNumber: () => {},
  onChangeCountry: () => {},
  onBlurPhoneInput: () => {},
};

export default InputPhoneNumber;
