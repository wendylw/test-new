import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const Input = ({
  className,
  placeholder,
  defaultSearchKeyword,
  allowClear,
  searching,
  onChangeInputValue,
  onClearInput,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <input type="text" />
    </div>
  );
};

Input.displayName = 'Input';

Input.propTypes = {
  children: PropTypes.node,
};

Input.defaultProps = {
  children: null,
};

export default Input;
