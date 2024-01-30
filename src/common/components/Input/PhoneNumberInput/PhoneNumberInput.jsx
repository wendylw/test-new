import React, { useRef } from 'react';
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
import { COUNTRIES } from '../../../utils/constants';
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
  const handleChangePhoneNumber = changedPhone => {
    if (!changedPhone) {
      onChange({ phone: changedPhone, status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE });
      onError({ type: ERROR_TYPES.EMPTY_PHONE_NUMBER });

      return;
    }

    const parseNumberObject = parsePhoneNumber(changedPhone);

    if (!parseNumberObject) {
      onChange({ phone: changedPhone, status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE });
      onError({ type: ERROR_TYPES.INVALID_PHONE_NUMBER });

      return;
    }

    const { number, country: parsedCountry } = parseNumberObject;
    const isValidNumber = isValidPhoneNumber(number);

    onChange({ phone: number, status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE });

    if (isValidNumber && COUNTRIES[parsedCountry]) {
      onError(null);
    } else if (parsedCountry && !COUNTRIES[parsedCountry]) {
      onError({ type: ERROR_TYPES.NOT_SUPPORTED_COUNTRY });
    } else {
      onError({ type: ERROR_TYPES.INVALID_PHONE_NUMBER });
    }
  };
  const handleChangeCountry = changedCountry => {
    if (changedCountry && changedCountry !== country) {
      onChange({ phone: '', status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE_COUNTRY });
      onCountryChange({ country: changedCountry, status: PHONE_NUMBER_INPUT_STATUS.ON_CHANGE_COUNTRY });
    }
  };
  const handleBlurPhoneNumberInput = event => {
    const { value: onBlurPhone } = event.target;

    if (!onBlurPhone) {
      onBlur({ phone: onBlurPhone, status: PHONE_NUMBER_INPUT_STATUS.ON_BLUR });
      onError({ type: ERROR_TYPES.EMPTY_PHONE_NUMBER });

      return;
    }

    const parseNumberObject = parsePhoneNumber(onBlurPhone);

    if (!parseNumberObject) {
      onBlur({ phone: onBlurPhone, status: PHONE_NUMBER_INPUT_STATUS.ON_BLUR });
      onError({ type: ERROR_TYPES.INVALID_PHONE_NUMBER });

      return;
    }

    const { number, country: parsedCountry } = parseNumberObject;
    const isValidNumber = isValidPhoneNumber(number);

    onBlur({ phone: number, status: PHONE_NUMBER_INPUT_STATUS.ON_BLUR });

    if (isValidNumber) {
      onError(null);
    } else if (parsedCountry && !COUNTRIES[parsedCountry]) {
      onError({ type: ERROR_TYPES.NOT_SUPPORTED_COUNTRY });
    } else {
      onError({ type: ERROR_TYPES.INVALID_PHONE_NUMBER });
    }
  };
  const handleFocusPhoneNumberInput = () => {
    onFocus({ status: PHONE_NUMBER_INPUT_STATUS.ON_FOCUS });
  };

  useMount(() => {
    setTimeout(() => {
      phoneNumberInputRef.current?.focus();
    });
  });

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
      value={formatPhoneNumberIntl(phone)}
      defaultCountry={phone}
      country={country}
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
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onError: PropTypes.func,
};

PhoneNumberInput.defaultProps = {
  className: null,
  placeholder: null,
  phone: '',
  country: 'MY',
  onChange: () => {},
  onCountryChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onError: () => {},
};
PhoneNumberInput.displayName = 'PhoneNumberInput';

export default PhoneNumberInput;
