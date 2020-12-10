import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import withDataAttributes from '../components/withDataAttributes';
import './Radio.scss';

class Radio extends PureComponent {
  handleOnChange = e => {
    const onChange = this.props.onChange;

    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  render() {
    const { className, checked = false, name = '', inputId = '', disabled = false, dataAttributes } = this.props;
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
          {...dataAttributes}
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

export default withDataAttributes(Radio);
