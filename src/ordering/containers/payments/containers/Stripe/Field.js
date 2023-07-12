import React from 'react';
import withDataAttributes from '../../../../../components/withDataAttributes';

const Field = withDataAttributes(
  ({
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
    dataAttributes,
    onBlur,
    error,
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
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          {...dataAttributes}
        />
      </div>
    </div>
  )
);

export default Field;
