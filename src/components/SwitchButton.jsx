import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import withDataAttributes from './withDataAttributes';
import './SwitchButton.scss';

class SwitchButton extends PureComponent {
  handleOnChange = e => {
    const { onChange } = this.props;

    onChange(e);
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
      // eslint-disable-next-line jsx-a11y/label-has-associated-control
      <label className={`switch-button ${className}`}>
        <input
          type={type}
          disabled={disabled}
          checked={checked ? 'checked' : ''}
          name={name}
          id={switchId}
          onChange={this.handleOnChange}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...dataAttributes}
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
  dataAttributes: PropTypes.objectOf(PropTypes.string),
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
  dataAttributes: {},
};

SwitchButton.displayName = 'SwitchButton';

export default withDataAttributes(SwitchButton);
