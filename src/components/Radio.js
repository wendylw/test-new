import React, { PureComponent } from 'react';

class Radio extends PureComponent {
  handleOnChange = e => {
    const onChange = this.props.onChange;
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  render() {
    const { checked = false, name = '', inputId = '' } = this.props;
    const active = checked ? 'active' : '';
    return (
      <div className={`radio ${active}`}>
        <i className="radio__check-icon"></i>
        <input onChange={this.handleOnChange} name={name} id={inputId} type="radio"></input>
      </div>
    );
  }
}
export default Radio;
