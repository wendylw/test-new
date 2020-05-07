import React, { Component } from 'react';
import { IconLeftArrow } from '../../components/Icons';

class Header extends Component {
  handleClickBack = () => {
    this.props.clickBack && this.props.clickBack();
  };

  render() {
    return (
      <header className="header flex flex-space-between">
        <button className="header__back-button" onClick={this.handleClickBack}>
          <IconLeftArrow />
        </button>
      </header>
    );
  }
}

export default Header;
