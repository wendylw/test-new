import React, { PureComponent } from 'react';
import withDataAttributes from '../components/withDataAttributes';

class Radio extends PureComponent {
  handleOnChange = e => {
    const onChange = this.props.onChange;
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  render() {
    const { checked = false, name = '', inputId = '', disabled = false, dataAttributes } = this.props;
    const active = checked ? 'active' : '';
    return (
      <div className={`radio ${active}`}>
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
export default withDataAttributes(Radio);
