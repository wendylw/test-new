import React, { Component } from 'react'
import PropTypes from 'prop-types'
import config from '../../config';
import Image from './Image';

class MainTopComponent extends Component {
  static propTypes = {
    logo: PropTypes.string,
    title: PropTypes.string,
  }

  render() {
    const { logo, title } = this.props;
    const { table } = config;

    return (
      <header className="header border-botton__divider flex flex-middle flex-space-between">
        <Image className="header__image-container text-middle" src={logo} alt={title} />
        <h1 className="header__title font-weight-bold text-middle">{title}</h1>
        <span className="gray-font-opacity">Table {table} </span>
      </header>
    )
  }
}

export default MainTopComponent;
