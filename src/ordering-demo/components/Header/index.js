import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Image from '../Image';

class Header extends Component {
  static propTypes = {
    logo: PropTypes.string,
    title: PropTypes.string,
  }

  render() {
    const { logo, title, table } = this.props;
    const classList = ['header border__bottom-divider flex flex-middle flex-space-between'];

    if (!table) {
      classList.push('has-table')
    }

    return (
      <header className={classList.join(' ')}>
        <Image className="header__image-container text-middle" src={logo} alt={title} />
        <h1 className="header__title font-weight-bold text-middle">{title}</h1>
        {
          table
            ? <span className="gray-font-opacity text-uppercase">Table {table}</span>
            : null
        }
      </header>
    )
  }
}

export default Header;
