import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './Radio.scss';
import { extractDataAttributes } from '../common/utils';

class Radio extends PureComponent {
  handleOnChange = e => {
    const onChange = this.props.onChange;

    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  render() {
    const { className, checked = false, name = '', inputId = '', disabled = false } = this.props;
    const active = checked ? 'active' : '';

    return (
      <div className={`radio flex__shrink-fixed ${active} ${className || ''}`}>
        <i className="radio__check-icon"></i>
        <input
          disabled={disabled}
          onChange={this.handleOnChange}
          name={name}
          id={inputId}
          type="radio"
          {...extractDataAttributes(this.props)}
        ></input>
      </div>
    );
  }
}

Radio.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  name: PropTypes.string,
  inputId: PropTypes.string,
  disabled: PropTypes.bool,
};

Radio.defaultProps = {
  checked: false,
  name: '',
  inputId: '',
  disabled: false,
};

Radio.displayName = 'Radio';

export default Radio;
