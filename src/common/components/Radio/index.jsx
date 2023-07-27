import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Radio.module.scss';

const RadioGroupContext = React.createContext(null);

export const RadioGroup = props => {
  const { children, name, value, onChange } = props;
  const onRadioValueChange = useCallback(
    e => {
      onChange(e.target.value);
    },
    [onChange]
  );
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange: onRadioValueChange }}>
      {children}
    </RadioGroupContext.Provider>
  );
};
RadioGroup.displayName = 'RadioGroup';
RadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
RadioGroup.defaultProps = {
  children: null,
  value: undefined,
  onChange: () => {},
};

const Radio = props => {
  const {
    name,
    children,
    value,
    checked,
    onChange,
    className = '',
    style = {},
    id,
    disabled = false,
    containerClassName = '',
    containerStyle = {},
  } = props;
  const context = useContext(RadioGroupContext);
  const { name: nameFromContext, value: valueFromContext, onChange: onChangeFromContext } = context || {};
  const onChangeCallback = useCallback(
    e => {
      onChange && onChange(e);
      onChangeFromContext && onChangeFromContext(e);
    },
    [onChange, onChangeFromContext]
  );
  const inputComponent = (
    <input
      id={id}
      type="radio"
      value={value}
      name={context ? nameFromContext : name}
      // if context is provided without value, we use `checked` on the Radio. If check is undefined, the component is not controlled.
      checked={context && valueFromContext !== undefined ? valueFromContext === value : checked}
      onChange={onChangeCallback}
      className={`${styles.radio} ${className}`}
      style={style}
      disabled={disabled}
      data-test-id="common.radio.input"
    />
  );
  if (!children) {
    return inputComponent;
  }
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className={containerClassName} style={containerStyle}>
      {children}
      {inputComponent}
    </label>
  );
};
Radio.displayName = 'Radio';
Radio.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  children: PropTypes.node,
  value: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  containerClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  containerStyle: PropTypes.object,
  id: PropTypes.string,
  disabled: PropTypes.bool,
};
Radio.defaultProps = {
  className: '',
  name: undefined,
  children: null,
  value: undefined,
  checked: undefined, // undefined means the component is not controlled
  onChange: undefined,
  style: {},
  containerClassName: '',
  containerStyle: {},
  id: undefined,
  disabled: false,
};
Radio.Group = RadioGroup;

export default Radio;
