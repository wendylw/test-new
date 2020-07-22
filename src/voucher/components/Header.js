import React, { Component } from 'react';
import { IconLeftArrow } from '../../components/Icons';
import withDataAttributes from '../../components/withDataAttributes';

class Header extends Component {
  handleClickBack = () => {
    this.props.clickBack && this.props.clickBack();
  };

  render() {
    const { dataAttributes } = this.props;
    return (
      <header className="header flex flex-space-between" {...dataAttributes}>
        <button className="header__back-button" onClick={this.handleClickBack}>
          <IconLeftArrow data-heap-name="voucher.common.header.back-btn" />
        </button>
      </header>
    );
  }
}

export default withDataAttributes(Header);
