import React, { PureComponent } from 'react';

class Radio extends PureComponent {
  handleOnChange = e => {
    const onChange = this.props.onChange;
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  render() {
    const { checked = false, name = '', inputId = '', disabled = false } = this.props;
    const active = checked ? 'active' : '';
    return (
      <div className={`radio ${active}`}>
        <i className="radio__check-icon"></i>
        <input disabled={disabled} onChange={this.handleOnChange} name={name} id={inputId} type="radio"></input>
      </div>
    );
  }
}
export default Radio;
