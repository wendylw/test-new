import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { extractDataAttributes } from '../common/utils';
import './SwitchButton.scss';

class SwitchButton extends PureComponent {
  handleOnChange = e => {
    const { onChange } = this.props;

    onChange(e);
  };

  render() {
    const { className = '', checked = '', name = '', switchId = '', disabled = false, type = 'radio' } = this.props;

    return (
      // eslint-disable-next-line jsx-a11y/label-has-associated-control
      <label className={`switch-button ${className}`}>
        <input
          type={type}
          disabled={disabled}
          checked={checked ? 'checked' : ''}
          name={name}
          id={switchId}
          onChange={this.handleOnChange}
          data-test-id="common.switch-button.input"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...extractDataAttributes(this.props)}
        />
        <span className="switch-button__slider" />
      </label>
    );
  }
}

SwitchButton.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  name: PropTypes.string,
  inputId: PropTypes.string,
  switchId: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  type: PropTypes.string,
};

SwitchButton.defaultProps = {
  className: '',
  checked: false,
  name: '',
  inputId: '',
  switchId: '',
  disabled: false,
  onChange: () => {},
  type: 'radio',
};

SwitchButton.displayName = 'SwitchButton';

export default SwitchButton;
