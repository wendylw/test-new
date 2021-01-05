import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import withDataAttributes from '../components/withDataAttributes';
import './SwitchButton.scss';

class SwitchButton extends PureComponent {
  handleOnChange = e => {
    const onChange = this.props.onChange;

    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  render() {
    const {
      className = '',
      checked = '',
      name = '',
      switchId = '',
      disabled = false,
      dataAttributes,
      type = 'radio',
    } = this.props;

    return (
      <label className={`switch-button ${className}`}>
        <input
          type={type}
          disabled={disabled}
          checked={checked ? 'checked' : ''}
          name={name}
          id={switchId}
          onChange={this.handleOnChange}
          {...dataAttributes}
        />
        <span className="switch-button__slider"></span>
      </label>
    );
  }
}

SwitchButton.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  name: PropTypes.string,
  inputId: PropTypes.string,
  disabled: PropTypes.bool,
};

SwitchButton.defaultProps = {
  checked: false,
  name: '',
  inputId: '',
  disabled: false,
  onChange: () => {},
  type: 'radio',
};

export default withDataAttributes(SwitchButton);
