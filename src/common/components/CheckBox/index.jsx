import React, { useContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './CheckBox.module.scss';

const CheckBoxGroupContext = React.createContext(null);

const getClassName = classList => classList.filter(className => !!className).join(' ');

export const CheckBoxGroup = props => {
  const { children, name, value, onChange } = props;
  const controlled = useMemo(() => value !== undefined, [value]);
  const valueSet = useMemo(() => new Set(value), [value]);
  const onCheckBoxValueChange = useCallback(
    e => {
      const { value: targetValue, checked } = e.target;
      if (checked) {
        valueSet.add(targetValue);
      } else {
        valueSet.delete(targetValue);
      }
      onChange(Array.from(valueSet));
    },
    [onChange, valueSet]
  );
  return (
    <CheckBoxGroupContext.Provider value={{ name, valueSet, onChange: onCheckBoxValueChange, controlled }}>
      {children}
    </CheckBoxGroupContext.Provider>
  );
};
CheckBoxGroup.displayName = 'CheckBoxGroup';
CheckBoxGroup.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
CheckBoxGroup.defaultProps = {
  children: null,
  value: undefined,
  onChange: () => {},
};

const CheckBox = props => {
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
    size,
  } = props;
  const context = useContext(CheckBoxGroupContext);
  const { name: nameFromContext, valueSet: valueSetFromContext, onChange: onChangeFromContext, controlled } =
    context || {};
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
      type="checkbox"
      value={value}
      name={context ? nameFromContext : name}
      checked={context && controlled ? valueSetFromContext.has(value) : checked}
      onChange={onChangeCallback}
      className={getClassName([styles.checkbox, className, size])}
      style={style}
      disabled={disabled}
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
CheckBox.displayName = 'CheckBox';
CheckBox.propTypes = {
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
  size: PropTypes.oneOf(['small']),
};
CheckBox.defaultProps = {
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
  size: null,
};
CheckBox.Group = CheckBoxGroup;

export default CheckBox;
