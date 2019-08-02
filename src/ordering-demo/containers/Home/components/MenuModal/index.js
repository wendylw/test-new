import React, { Component } from 'react';
import Menu from '../Menu';

class MenuModal extends Component {
  render() {
    const { categories } = this.props;
    const className = ["aside", "active"];

    return (
      <div className={className.join(' ')} onClick={this.handleClickOverlay}>
        <Menu categories={categories} onClickItem={this.handleClickMenuItem} />
      </div>
    );
  }

  handleClickOverlay = e => {
    if (e.target === e.currentTarget) {
      this.props.onHide();
    }
  };

  handleClickMenuItem = () => {
    this.props.onHide();
  }
}

export default MenuModal;
