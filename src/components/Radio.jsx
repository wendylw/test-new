import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import withDataAttributes from './withDataAttributes';
import './Radio.scss';

class Radio extends PureComponent {
  handleOnChange = e => {
    const { onChange } = this.props;

    onChange(e);
  };

  render() {
    const { className, checked = false, name = '', inputId = '', disabled = false, dataAttributes } = this.props;
    const active = checked ? 'active' : '';

    return (
      <div className={`radio flex__shrink-fixed ${active} ${className || ''}`}>
        <i className="radio__check-icon" />
        <input
          disabled={disabled}
          onChange={this.handleOnChange}
          name={name}
          id={inputId}
          type="radio"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...dataAttributes}
        />
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
  onChange: PropTypes.func,
  dataAttributes: PropTypes.objectOf(PropTypes.string),
};

Radio.defaultProps = {
  name: '',
  inputId: '',
  className: '',
  checked: false,
  disabled: false,
  dataAttributes: {},
  onChange: () => {},
};

Radio.displayName = 'Radio';

export default withDataAttributes(Radio);
