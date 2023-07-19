import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { IconDone } from './Icons';
import './CheckBox.scss';
import { extractDataAttributes } from '../common/utils';

class CheckBox extends PureComponent {
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
      <div className={`checkbox flex__shrink-fixed ${active} ${className || ''}`}>
        <IconDone className="checkbox__check-icon icon icon__small border-radius-base" />
        <input
          disabled={disabled}
          onChange={this.handleOnChange}
          name={name}
          id={inputId}
          type="checkbox"
          {...extractDataAttributes(this.props)}
        ></input>
      </div>
    );
  }
}

CheckBox.displayName = 'CheckBox';

CheckBox.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  name: PropTypes.string,
  inputId: PropTypes.string,
  disabled: PropTypes.bool,
};

CheckBox.defaultProps = {
  checked: false,
  name: '',
  inputId: '',
  disabled: false,
};

export default CheckBox;
