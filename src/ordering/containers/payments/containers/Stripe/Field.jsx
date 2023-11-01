import React from 'react';
import PropTypes from 'prop-types';
import { extractDataAttributes } from '../../../../../common/utils';

const Field = ({
  t,
  label,
  formClassName,
  inputClassName,
  id,
  type,
  placeholder,
  required,
  autoComplete,
  showRequiredLabel,
  value,
  onChange,
  onBlur,
  error,
  ...restProps
}) => (
  <div className={formClassName}>
    <div className="flex flex-middle flex-space-between padding-top-bottom-small">
      <label htmlFor={id} className="text-size-big text-weight-bolder">
        {label}
      </label>
      {showRequiredLabel ? (
        <span className="form__error-message text-weight-bolder text-uppercase">{t('RequiredMessage')}</span>
      ) : null}
    </div>
    <div className={`form__group ${error || showRequiredLabel ? 'error' : ''}`}>
      <input
        className={inputClassName}
        data-test-id="ordering.payment.stripe.input"
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...extractDataAttributes(restProps)}
      />
    </div>
  </div>
);

Field.displayName = 'Field';

Field.propTypes = {
  id: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  required: PropTypes.bool,
  showRequiredLabel: PropTypes.bool,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  formClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
};

Field.defaultProps = {
  id: '',
  type: 'text',
  label: '',
  value: '',
  error: '',
  required: false,
  placeholder: '',
  autoComplete: 'off',
  formClassName: '',
  inputClassName: '',
  showRequiredLabel: false,
  onBlur: () => {},
  onChange: () => {},
};

export default Field;
