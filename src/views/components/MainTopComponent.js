import React, { Component } from 'react'
import PropTypes from 'prop-types'
import config from '../../config';

class MainTopComponent extends Component {
  static propTypes = {
    logo: PropTypes.string,
    title: PropTypes.string,
  }

  render() {
    const { logo, title } = this.props;
    const { table } = config;

    return (
      <header className="header border__botton-divider flex flex-middle flex-space-between">
        <figure className="header__image-container text-middle">
          <img src={logo} alt={title} />
        </figure>
        <h1 className="header__title font-weight-bold text-middle">{title}</h1>
        <span className="gray-font-opacity">Table {table} </span>
      </header>
    )
  }
}

export default MainTopComponent;
